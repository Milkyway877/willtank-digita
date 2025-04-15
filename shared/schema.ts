import { pgTable, text, serial, integer, boolean, timestamp, date, uniqueIndex, pgEnum, foreignKey, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // Using username as email
  password: text("password").notNull(),
  fullName: text("full_name"),
  isEmailVerified: boolean("is_email_verified").default(false),
  verificationCode: text("verification_code"),
  verificationCodeExpiry: timestamp("verification_code_expiry"),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpiry: timestamp("reset_password_expiry"),
  preferences: json("preferences"), // Storing user preferences as JSON
  lastCheckIn: timestamp("last_check_in"),
  nextCheckInDue: timestamp("next_check_in_due"),
  // 2FA fields
  twoFactorEnabled: boolean("twofa_enabled").default(false),
  twoFactorSecret: text("twofa_secret"),
  backupCodes: json("backup_codes"), // Storing backup codes as JSON array
  // Stripe-related fields
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default("inactive"),
  planType: text("plan_type").default("free"),
  planInterval: text("plan_interval"),
  planExpiry: timestamp("plan_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Role status enum
export const roleStatusEnum = pgEnum("role_status", ["pending", "verified", "declined"]);

// Beneficiaries table
export const beneficiaries = pgTable("beneficiaries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  relationship: text("relationship").notNull(),
  phone: text("phone"),
  verificationCode: text("verification_code"),
  verificationCodeExpiry: timestamp("verification_code_expiry"),
  status: roleStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Executors table
export const executors = pgTable("executors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  relationship: text("relationship").notNull(),
  phone: text("phone"),
  verificationCode: text("verification_code"),
  verificationCodeExpiry: timestamp("verification_code_expiry"),
  status: roleStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Death verifiers table (the 5 trusted contacts)
export const deathVerifiers = pgTable("death_verifiers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  relationship: text("relationship").notNull(),
  phone: text("phone"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Weekly check-in responses table
export const checkInResponses = pgTable("check_in_responses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  responderEmail: text("responder_email").notNull(),
  responderType: text("responder_type").notNull(), // 'user', 'beneficiary', 'executor'
  responseDate: timestamp("response_date").defaultNow().notNull(),
  isAlive: boolean("is_alive").notNull(),
});

// Death verification OTP table (for the 5-way unlock)
export const deathVerificationOtps = pgTable("death_verification_otps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  verifierId: integer("verifier_id").notNull().references(() => deathVerifiers.id),
  otp: text("otp").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  usedAt: timestamp("used_at"),
});

// Documents table (no longer linked to wills)
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadDate: timestamp("upload_date").defaultNow(),
  fileUrl: text("file_url").notNull(),
  category: text("category").default("general"),
});

// Define document relations
export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
}));

// Notification types enum
export const notificationTypeEnum = pgEnum("notification_type", ["info", "warning", "success"]);

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").default("info").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  relatedEntityType: text("related_entity_type"), // 'will', 'document', 'beneficiary', etc.
  relatedEntityId: integer("related_entity_id"), // ID of the related entity
});

// Define user relations
export const usersRelations = relations(users, ({ many }) => ({
  beneficiaries: many(beneficiaries),
  executors: many(executors),
  deathVerifiers: many(deathVerifiers),
  documents: many(documents),
  notifications: many(notifications),
}));

// Define base schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
});

// Email validation for username field
export const extendedInsertUserSchema = insertUserSchema.extend({
  username: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  fullName: z.string().optional(),
});

export const insertBeneficiarySchema = createInsertSchema(beneficiaries).pick({
  userId: true,
  email: true,
  fullName: true,
  relationship: true,
  phone: true,
});

export const insertExecutorSchema = createInsertSchema(executors).pick({
  userId: true,
  email: true,
  fullName: true,
  relationship: true,
  phone: true,
});

export const insertDeathVerifierSchema = createInsertSchema(deathVerifiers).pick({
  userId: true,
  email: true,
  fullName: true,
  relationship: true,
  phone: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  userId: true,
  fileName: true,
  fileType: true,
  fileSize: true,
  fileUrl: true,
  category: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  message: true,
  type: true,
  relatedEntityType: true,
  relatedEntityId: true,
});

// Delivery Settings table
export const deliverySettings = pgTable("delivery_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  method: text("method").notNull(), // email, attorney, executor
  contacts: json("contacts").notNull(), // array of contact objects
  message: text("message"),
  attorneyContact: json("attorney_contact"), // single contact object if method is attorney
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersToDeliverySettings = relations(users, ({ one }) => ({
  deliverySettings: one(deliverySettings, {
    fields: [users.id],
    references: [deliverySettings.userId],
  }),
}));

export const deliverySettingsToUsers = relations(deliverySettings, ({ one }) => ({
  user: one(users, {
    fields: [deliverySettings.userId],
    references: [users.id],
  }),
}));

export const insertDeliverySettingsSchema = createInsertSchema(deliverySettings).pick({
  userId: true,
  method: true,
  contacts: true,
  message: true,
  attorneyContact: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBeneficiary = z.infer<typeof insertBeneficiarySchema>;
export type Beneficiary = typeof beneficiaries.$inferSelect;
export type InsertExecutor = z.infer<typeof insertExecutorSchema>;
export type Executor = typeof executors.$inferSelect;
export type InsertDeathVerifier = z.infer<typeof insertDeathVerifierSchema>;
export type DeathVerifier = typeof deathVerifiers.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertDeliverySettings = z.infer<typeof insertDeliverySettingsSchema>;
export type DeliverySettings = typeof deliverySettings.$inferSelect;

// Reminder repeat type enum
export const reminderRepeatEnum = pgEnum("reminder_repeat", ["never", "daily", "weekly", "monthly", "yearly"]);

// Reminders table
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  date: date("date").notNull(),
  time: text("time"),
  repeat: reminderRepeatEnum("repeat").default("never").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define reminder relations
export const remindersRelations = relations(reminders, ({ one }) => ({
  user: one(users, {
    fields: [reminders.userId],
    references: [users.id],
  }),
}));

// Add reminders to user relations
export const usersToReminders = relations(users, ({ many }) => ({
  reminders: many(reminders),
}));

export const insertReminderSchema = createInsertSchema(reminders).pick({
  userId: true,
  title: true,
  description: true,
  date: true,
  time: true,
  repeat: true,
  completed: true,
});

export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;

// Will template type enum
export const willTemplateEnum = pgEnum("will_template", ["basic", "married", "elder", "business"]);

// Will status enum
export const willStatusEnum = pgEnum("will_status", ["draft", "completed", "locked"]);

// Wills table
export const wills = pgTable("wills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content"),
  template: willTemplateEnum("template").default("basic").notNull(),
  status: willStatusEnum("status").default("draft").notNull(),
  dataJson: json("data_json"), // Store all chat answers as JSON
  isComplete: boolean("is_complete").default(false),
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Will documents table (for documents specific to a will)
export const willDocuments = pgTable("will_documents", {
  id: serial("id").primaryKey(),
  willId: integer("will_id").notNull().references(() => wills.id),
  name: text("name").notNull(),
  path: text("path").notNull(),
  type: text("type").notNull(),
  uploadDate: timestamp("upload_date").defaultNow(),
  size: integer("size").notNull(),
});

// Will contact table
export const willContacts = pgTable("will_contacts", {
  id: serial("id").primaryKey(),
  willId: integer("will_id").notNull().references(() => wills.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  country: text("country"),
  role: text("role").notNull(), // beneficiary, executor, witness
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define will relations
export const willsRelations = relations(wills, ({ one, many }) => ({
  user: one(users, {
    fields: [wills.userId],
    references: [users.id],
  }),
  documents: many(willDocuments),
  contacts: many(willContacts),
}));

// Define will document relations
export const willDocumentsRelations = relations(willDocuments, ({ one }) => ({
  will: one(wills, {
    fields: [willDocuments.willId],
    references: [wills.id],
  }),
}));

// Define will contact relations
export const willContactsRelations = relations(willContacts, ({ one }) => ({
  will: one(wills, {
    fields: [willContacts.willId],
    references: [wills.id],
  }),
}));

// Add wills to user relations
export const usersToWills = relations(users, ({ many }) => ({
  wills: many(wills),
}));

// Will schemas
export const insertWillSchema = createInsertSchema(wills).pick({
  userId: true,
  title: true,
  content: true,
  template: true,
  status: true,
  dataJson: true,
  isComplete: true,
  videoUrl: true,
});

export const insertWillDocumentSchema = createInsertSchema(willDocuments).pick({
  willId: true,
  name: true,
  path: true,
  type: true,
  size: true,
});

export const insertWillContactSchema = createInsertSchema(willContacts).pick({
  willId: true,
  name: true,
  email: true,
  phone: true,
  country: true,
  role: true,
});

// Will types
export type InsertWill = z.infer<typeof insertWillSchema>;
export type Will = typeof wills.$inferSelect;
export type InsertWillDocument = z.infer<typeof insertWillDocumentSchema>;
export type WillDocument = typeof willDocuments.$inferSelect;
export type InsertWillContact = z.infer<typeof insertWillContactSchema>;
export type WillContact = typeof willContacts.$inferSelect;
