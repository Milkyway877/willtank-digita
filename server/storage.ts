import { users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, and, lt, isNull, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

export interface IStorage {
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
}

export const storage = new DatabaseStorage();
