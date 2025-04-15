import { 
  users, type User, type InsertUser,
  documents, type Document, type InsertDocument,
  notifications, type Notification, type InsertNotification,
  wills, type Will, type InsertWill,
  willDocuments, type WillDocument, type InsertWillDocument,
  willContacts, type WillContact, type InsertWillContact
} from "@shared/schema";
import { db } from "./db";
import { eq, and, lt, isNull, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

export interface IStorage {
  // User authentication methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserByVerificationCode(code: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  setVerificationCode(userId: number, code: string, expiryMinutes: number): Promise<User>;
  setResetToken(userId: number, token: string, expiryMinutes: number): Promise<User>;
  verifyEmail(userId: number): Promise<User>;
  updatePassword(userId: number, hashedPassword: string): Promise<User>;
  clearVerificationCode(userId: number): Promise<void>;
  clearResetToken(userId: number): Promise<void>;
  sessionStore: session.Store;
  
  // Onboarding methods
  updateOnboardingStatus(userId: number, hasCompleted: boolean): Promise<User>;
  saveUserProfile(userId: number, profile: { fullName?: string, [key: string]: any }): Promise<User>;
  
  // Document management methods
  getUserDocuments(userId: number): Promise<Document[]>;
  getDocumentById(documentId: number): Promise<Document | undefined>;
  addDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(documentId: number): Promise<void>;
  
  // Will management methods
  getUserWills(userId: number): Promise<Will[]>;
  getWillById(willId: number): Promise<Will | undefined>;
  createWill(will: InsertWill): Promise<Will>;
  updateWill(willId: number, updates: Partial<InsertWill>): Promise<Will>;
  deleteWill(willId: number): Promise<void>;
  
  // Will documents methods
  getWillDocuments(willId: number): Promise<WillDocument[]>;
  addWillDocument(document: InsertWillDocument): Promise<WillDocument>;
  deleteWillDocument(documentId: number): Promise<void>;
  
  // Will contacts methods
  getWillContacts(willId: number): Promise<WillContact[]>;
  addWillContact(contact: InsertWillContact): Promise<WillContact>;
  updateWillContact(contactId: number, updates: Partial<InsertWillContact>): Promise<WillContact>;
  deleteWillContact(contactId: number): Promise<void>;
  
  // Notification methods
  getUserNotifications(userId: number): Promise<Notification[]>;
  getUserUnreadNotificationCount(userId: number): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(notificationId: number): Promise<Notification>;
  markAllUserNotificationsAsRead(userId: number): Promise<void>;
  deleteNotification(notificationId: number): Promise<void>;
}

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUserByVerificationCode(code: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.verificationCode, code),
          sql`${users.verificationCodeExpiry} IS NOT NULL`,
          sql`${users.verificationCodeExpiry} > NOW()`
        )
      );
    return user || undefined;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.resetPasswordToken, token),
          sql`${users.resetPasswordExpiry} IS NOT NULL`,
          sql`${users.resetPasswordExpiry} > NOW()`
        )
      );
    return user || undefined;
  }

  async setVerificationCode(userId: number, code: string, expiryMinutes: number): Promise<User> {
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + expiryMinutes);
    
    const [updated] = await db
      .update(users)
      .set({
        verificationCode: code,
        verificationCodeExpiry: expiryDate,
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updated;
  }

  async setResetToken(userId: number, token: string, expiryMinutes: number): Promise<User> {
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + expiryMinutes);
    
    const [updated] = await db
      .update(users)
      .set({
        resetPasswordToken: token,
        resetPasswordExpiry: expiryDate,
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updated;
  }

  async verifyEmail(userId: number): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({
        isEmailVerified: true,
        verificationCode: null,
        verificationCodeExpiry: null,
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updated;
  }

  async updatePassword(userId: number, hashedPassword: string): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updated;
  }

  async clearVerificationCode(userId: number): Promise<void> {
    await db
      .update(users)
      .set({
        verificationCode: null,
        verificationCodeExpiry: null,
      })
      .where(eq(users.id, userId));
  }

  async clearResetToken(userId: number): Promise<void> {
    await db
      .update(users)
      .set({
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      })
      .where(eq(users.id, userId));
  }

  // Onboarding methods implementation
  async updateOnboardingStatus(userId: number, hasCompleted: boolean): Promise<User> {
    // Store onboarding status in preferences
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User not found: ${userId}`);
    
    const preferences = user.preferences ? 
      JSON.parse(user.preferences as string) : {};
    
    preferences.hasCompletedOnboarding = hasCompleted;
    
    const [updated] = await db
      .update(users)
      .set({
        preferences: JSON.stringify(preferences) as any,
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updated;
  }

  async saveUserProfile(userId: number, profile: { fullName?: string, [key: string]: any }): Promise<User> {
    // Extract specific fields that go into columns
    const { fullName, ...otherDetails } = profile;
    
    // Store other details as JSON in preferences
    const preferences = JSON.stringify(otherDetails);
    
    const [updated] = await db
      .update(users)
      .set({
        fullName: fullName || undefined,
        preferences: preferences as any, // Type cast to satisfy TypeScript
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updated;
  }

  // Document management methods implementation
  async getUserDocuments(userId: number): Promise<Document[]> {
    return db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(sql`${documents.uploadDate} DESC`);
  }

  async getDocumentById(documentId: number): Promise<Document | undefined> {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId));
    return document;
  }

  async addDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db
      .insert(documents)
      .values(document)
      .returning();
    return newDocument;
  }

  async deleteDocument(documentId: number): Promise<void> {
    await db
      .delete(documents)
      .where(eq(documents.id, documentId));
  }

  // Notification methods implementation
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(sql`${notifications.createdAt} DESC`);
  }

  async getUserUnreadNotificationCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    
    return result[0]?.count || 0;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    
    return newNotification;
  }

  async markNotificationAsRead(notificationId: number): Promise<Notification> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId))
      .returning();
    
    return updatedNotification;
  }

  async markAllUserNotificationsAsRead(userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
  }

  async deleteNotification(notificationId: number): Promise<void> {
    await db
      .delete(notifications)
      .where(eq(notifications.id, notificationId));
  }
  
  // Will management methods implementation
  async getUserWills(userId: number): Promise<Will[]> {
    return db
      .select()
      .from(wills)
      .where(eq(wills.userId, userId))
      .orderBy(sql`${wills.lastUpdated} DESC`);
  }

  async getWillById(willId: number): Promise<Will | undefined> {
    const [will] = await db
      .select()
      .from(wills)
      .where(eq(wills.id, willId));
    return will;
  }

  async createWill(will: InsertWill): Promise<Will> {
    const [newWill] = await db
      .insert(wills)
      .values(will)
      .returning();
    return newWill;
  }

  async updateWill(willId: number, updates: Partial<InsertWill>): Promise<Will> {
    const [updatedWill] = await db
      .update(wills)
      .set({
        ...updates,
        lastUpdated: new Date() // Always update the timestamp
      })
      .where(eq(wills.id, willId))
      .returning();
    
    return updatedWill;
  }

  async deleteWill(willId: number): Promise<void> {
    // First delete all related will documents and contacts
    await db
      .delete(willDocuments)
      .where(eq(willDocuments.willId, willId));
    
    await db
      .delete(willContacts)
      .where(eq(willContacts.willId, willId));
    
    // Then delete the will itself
    await db
      .delete(wills)
      .where(eq(wills.id, willId));
  }

  // Will documents methods implementation
  async getWillDocuments(willId: number): Promise<WillDocument[]> {
    return db
      .select()
      .from(willDocuments)
      .where(eq(willDocuments.willId, willId))
      .orderBy(sql`${willDocuments.uploadDate} DESC`);
  }

  async addWillDocument(document: InsertWillDocument): Promise<WillDocument> {
    // Ensure necessary fields are present
    if (!document.willId || !document.userId || !document.fileName || !document.fileUrl) {
      throw new Error("Missing required fields for document upload");
    }
    
    const [newDocument] = await db
      .insert(willDocuments)
      .values(document)
      .returning();
    return newDocument;
  }

  async deleteWillDocument(documentId: number): Promise<void> {
    await db
      .delete(willDocuments)
      .where(eq(willDocuments.id, documentId));
  }

  // Will contacts methods implementation
  async getWillContacts(willId: number): Promise<WillContact[]> {
    return db
      .select()
      .from(willContacts)
      .where(eq(willContacts.willId, willId))
      .orderBy(sql`${willContacts.createdAt} DESC`);
  }

  async addWillContact(contact: InsertWillContact): Promise<WillContact> {
    const [newContact] = await db
      .insert(willContacts)
      .values(contact)
      .returning();
    return newContact;
  }

  async updateWillContact(contactId: number, updates: Partial<InsertWillContact>): Promise<WillContact> {
    const [updatedContact] = await db
      .update(willContacts)
      .set({
        ...updates,
        updatedAt: new Date() // Always update the timestamp
      })
      .where(eq(willContacts.id, contactId))
      .returning();
    
    return updatedContact;
  }

  async deleteWillContact(contactId: number): Promise<void> {
    await db
      .delete(willContacts)
      .where(eq(willContacts.id, contactId));
  }
}

export const storage = new DatabaseStorage();
