import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { setupAuth, comparePasswords } from "./auth";
import { initializeScheduler, triggerCheckInEmails } from "./scheduler";
import { storage as dbStorage } from "./storage";
import { db } from "./db";
import { uploadFile, deleteFile } from "./supabase-connector";
import { 
  checkInResponses, 
  users, 
  notifications, 
  insertNotificationSchema,
  deliverySettings,
  beneficiaries,
  reminders,
  wills,
  willDocuments,
  willContacts,
  insertWillSchema,
  insertWillDocumentSchema,
  insertWillContactSchema,
  willTemplateEnum,
  willStatusEnum
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { NotificationEvents, createNotification } from "./notification-util";
import { sendEmail, createVerificationEmailTemplate } from "./email";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  generateSecret, 
  verifyToken, 
  generateBackupCodes, 
  verifyBackupCode,
  enable2FA,
  disable2FA,
  get2FAStatus
} from "./2fa-util";
import { 
  stripe,
  createCheckoutSession,
  createBillingPortalSession,
  updateUserSubscription,
  cancelSubscription,
  PlanType, 
  PricingInterval 
} from "./stripe";

import { getChatCompletion, getStreamingChatCompletion } from './openai';
import { 
  extractContactsFromConversation, 
  processAndSaveContacts, 
  createContactDetailsPrompt 
} from './contact-extraction';
import { 
  extractDocumentSuggestions, 
  createDocumentUploadPrompt 
} from './document-extraction';

// Helper function to check if a user is authenticated via session
// This is a TypeScript type guard that ensures req.user exists after this check
function isUserAuthenticated(req: Request): req is Request & { user: Express.User } {
  return !!(req.user);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up auth routes first to establish authentication
  setupAuth(app);
  
  // Initialize the scheduler for weekly check-ins
  initializeScheduler();
  
  // Set up static file serving for uploads
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  // Serve uploaded files statically
  app.use('/uploads', (req, res, next) => {
    // Basic security check to prevent directory traversal
    if (req.path.includes('..') || req.path.includes('~')) {
      return res.status(403).send('Forbidden');
    }
    next();
  });
  app.use('/uploads', express.static(uploadDir));
  
  // Skyler AI Chat Endpoint
  app.post("/api/skyler/chat", async (req: Request, res: Response) => {
    // Check if user is authenticated
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages must be an array" });
      }

      const result = await getChatCompletion(messages);
      
      if (result.success) {
        res.json({ message: result.data });
      } else {
        res.status(500).json({ error: result.error });
      }
    } catch (error: any) {
      console.error("Error in Skyler chat endpoint:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Skyler AI Chat Streaming Endpoint
  app.post("/api/skyler/chat-stream", async (req: Request, res: Response) => {
    // Check if user is authenticated
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages must be an array" });
      }

      const result = await getStreamingChatCompletion(messages);
      
      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      // Set headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Handle streaming response
      if (result.stream) {
        for await (const chunk of result.stream) {
          // Send the content as an event
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        }
      } else {
        return res.status(500).json({ error: "Stream not available" });
      }

      // End the stream
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error("Error in Skyler streaming chat endpoint:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });
  // Auth routes and scheduler have already been initialized above

  // Configure multer for file uploads
  const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ 
    storage: fileStorage, 
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB file size limit
  });
  
  // Document API endpoints for general document storage - no longer tied to wills
  
  // GET all documents for a user
  app.get("/api/documents", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const documents = await dbStorage.getUserDocuments(userId);
      return res.status(200).json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      return res.status(500).json({ error: "Failed to fetch documents" });
    }
  });
  
  // Generic document upload route (no longer associated with wills)
  app.post("/api/documents", upload.single('file'), async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const userId = req.user!.id;
      const category = req.body.category || 'general';
      
      // Read the file content
      const fileContent = fs.readFileSync(req.file.path);
      
      // Create a File object from the file content
      const documentFile = new File(
        [fileContent], 
        req.file.originalname, 
        { type: req.file.mimetype }
      );
      
      // Upload to Supabase storage
      const uploadResult = await uploadFile(
        documentFile, 
        userId.toString(), 
        "documents"
      );
      
      // Clean up local temporary file after upload
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error ? uploadResult.error.toString() : "Failed to upload to Supabase storage");
      }
      
      // Get the URL from Supabase upload
      const fileUrl = uploadResult.data?.url || "";
      
      // Store document in database
      const documentData = {
        userId,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        fileUrl,
        category
      };
      
      const document = await dbStorage.addDocument(documentData);
      
      return res.status(201).json({
        ...document,
        cloudStorage: true,
        message: "Document uploaded successfully"
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      // Clean up temporary file if it was uploaded
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({ error: "Failed to upload document" });
    }
  });
  
  // Get document by ID
  app.get("/api/documents/:id", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const documentId = parseInt(req.params.id);
      if (isNaN(documentId)) {
        return res.status(400).json({ error: "Invalid document ID" });
      }
      
      const document = await dbStorage.getDocumentById(documentId);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      // Make sure the user can only access their own documents
      if (document.userId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      return res.status(200).json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      return res.status(500).json({ error: "Failed to fetch document" });
    }
  });
  
  // Delete document by ID 
  app.delete("/api/documents/:id", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const documentId = parseInt(req.params.id);
      if (isNaN(documentId)) {
        return res.status(400).json({ error: "Invalid document ID" });
      }
      
      // Get the document first to check ownership and get the filename
      const document = await dbStorage.getDocumentById(documentId);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      // Make sure the user can only delete their own documents
      if (document.userId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Extract the filename from the URL
      const fileUrl = document.fileUrl;
      const urlParts = fileUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      // Try to delete from Supabase storage
      try {
        const storagePath = `${req.user!.id}/documents/${filename}`;
        await deleteFile(storagePath);
        console.log('Deleted file from Supabase storage:', storagePath);
      } catch (deleteError) {
        console.error('Error deleting from cloud storage:', deleteError);
        // We continue even if storage deletion fails
      }
      
      // Delete from database
      await dbStorage.deleteDocument(documentId);
      
      return res.status(200).json({ 
        success: true, 
        message: "Document deleted successfully",
        cloudStorage: true
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      return res.status(500).json({ error: "Failed to delete document" });
    }
  });
  
  // Dashboard-related endpoints go here

  // Will endpoints
  app.get("/api/wills", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const wills = await dbStorage.getUserWills(req.user.id);
      return res.status(200).json(wills);
    } catch (error) {
      console.error("Error fetching wills:", error);
      return res.status(500).json({ error: "Failed to fetch wills" });
    }
  });

  // Get a specific will by ID
  app.get("/api/wills/:id", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const willId = parseInt(req.params.id);
      const will = await dbStorage.getWillById(willId);
      
      if (!will) {
        return res.status(404).json({ error: "Will not found" });
      }
      
      // Security check - only allow access to user's own wills
      if (will.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      return res.status(200).json(will);
    } catch (error) {
      console.error("Error fetching will:", error);
      return res.status(500).json({ error: "Failed to fetch will" });
    }
  });
  
  // Create a new will
  app.post("/api/wills", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const willData = {
        ...req.body,
        userId: req.user.id,
        // Make sure dataJson is stored as a string if it's an object
        dataJson: req.body.dataJson ? 
          (typeof req.body.dataJson === 'string' ? 
            req.body.dataJson : 
            JSON.stringify(req.body.dataJson)) : 
          null
      };
      
      // Validate the data with zod schema
      const validatedData = insertWillSchema.parse(willData);
      
      const newWill = await dbStorage.createWill(validatedData);
      return res.status(201).json(newWill);
    } catch (error) {
      console.error("Error creating will:", error);
      return res.status(500).json({ error: "Failed to create will" });
    }
  });
  
  // Update a will
  app.put("/api/wills/:id", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const willId = parseInt(req.params.id);
      const will = await dbStorage.getWillById(willId);
      
      if (!will) {
        return res.status(404).json({ error: "Will not found" });
      }
      
      // Security check - only allow updates to user's own wills
      if (will.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Process updates
      const updates = {
        ...req.body,
        // Make sure dataJson is stored as a string if it's an object
        dataJson: req.body.dataJson ? 
          (typeof req.body.dataJson === 'string' ? 
            req.body.dataJson : 
            JSON.stringify(req.body.dataJson)) : 
          undefined
      };
      
      const updatedWill = await dbStorage.updateWill(willId, updates);
      return res.status(200).json(updatedWill);
    } catch (error) {
      console.error("Error updating will:", error);
      return res.status(500).json({ error: "Failed to update will" });
    }
  });
  
  // Delete a will
  app.delete("/api/wills/:id", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const willId = parseInt(req.params.id);
      const will = await dbStorage.getWillById(willId);
      
      if (!will) {
        return res.status(404).json({ error: "Will not found" });
      }
      
      // Security check - only allow deletion of user's own wills
      if (will.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      await dbStorage.deleteWill(willId);
      return res.status(200).json({ message: "Will deleted successfully" });
    } catch (error) {
      console.error("Error deleting will:", error);
      return res.status(500).json({ error: "Failed to delete will" });
    }
  });
  
  // Get documents for a specific will
  app.get("/api/wills/:id/documents", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const willId = parseInt(req.params.id);
      const will = await dbStorage.getWillById(willId);
      
      if (!will) {
        return res.status(404).json({ error: "Will not found" });
      }
      
      // Security check - only allow access to user's own wills
      if (will.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const documents = await dbStorage.getWillDocuments(willId);
      return res.status(200).json(documents);
    } catch (error) {
      console.error("Error fetching will documents:", error);
      return res.status(500).json({ error: "Failed to fetch will documents" });
    }
  });
  
  // Add document to a will
  app.post("/api/wills/:id/documents", upload.single('file'), async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    try {
      const willId = parseInt(req.params.id);
      const will = await dbStorage.getWillById(willId);
      
      if (!will) {
        return res.status(404).json({ error: "Will not found" });
      }
      
      // Security check - only allow uploads to user's own wills
      if (will.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Read the file content
      const fileContent = fs.readFileSync(req.file.path);
      
      // Create a File object from the file content
      const documentFile = new File(
        [fileContent], 
        req.file.originalname, 
        { type: req.file.mimetype }
      );
      
      // Organize files by user ID and will ID
      const uploadResult = await uploadFile(
        documentFile, 
        `${req.user.id}/wills/${willId}/documents`,
        req.file.originalname
      );
      
      // Clean up local temporary file after upload
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error ? uploadResult.error.toString() : "Failed to upload to storage");
      }
      
      // Get the URL from upload
      const fileUrl = uploadResult.data?.url || "";
      
      // Store document in database
      const document = await dbStorage.addWillDocument({
        willId,
        name: req.file.originalname,
        path: fileUrl,
        type: req.file.mimetype,
        size: req.file.size
      });
      
      return res.status(201).json(document);
    } catch (error) {
      console.error("Error uploading will document:", error);
      // Clean up temporary file if it was uploaded
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({ error: "Failed to upload will document" });
    }
  });
  
  // Delete document from a will
  app.delete("/api/wills/:willId/documents/:docId", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const willId = parseInt(req.params.willId);
      const docId = parseInt(req.params.docId);
      
      const will = await dbStorage.getWillById(willId);
      
      if (!will) {
        return res.status(404).json({ error: "Will not found" });
      }
      
      // Security check - only allow deletions from user's own wills
      if (will.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      await dbStorage.deleteWillDocument(docId);
      return res.status(200).json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting will document:", error);
      return res.status(500).json({ error: "Failed to delete will document" });
    }
  });
  
  // Get contacts for a specific will
  app.get("/api/wills/:id/contacts", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const willId = parseInt(req.params.id);
      const will = await dbStorage.getWillById(willId);
      
      if (!will) {
        return res.status(404).json({ error: "Will not found" });
      }
      
      // Security check - only allow access to user's own wills
      if (will.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const contacts = await dbStorage.getWillContacts(willId);
      return res.status(200).json(contacts);
    } catch (error) {
      console.error("Error fetching will contacts:", error);
      return res.status(500).json({ error: "Failed to fetch will contacts" });
    }
  });
  
  // Add contact to a will
  app.post("/api/wills/:id/contacts", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const willId = parseInt(req.params.id);
      const will = await dbStorage.getWillById(willId);
      
      if (!will) {
        return res.status(404).json({ error: "Will not found" });
      }
      
      // Security check - only allow additions to user's own wills
      if (will.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const contactData = {
        ...req.body,
        willId
      };
      
      // Validate with schema
      const validatedData = insertWillContactSchema.parse(contactData);
      
      const contact = await dbStorage.addWillContact(validatedData);
      return res.status(201).json(contact);
    } catch (error) {
      console.error("Error adding will contact:", error);
      return res.status(500).json({ error: "Failed to add will contact" });
    }
  });
  
  // Update contact for a will
  app.put("/api/wills/:willId/contacts/:contactId", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const willId = parseInt(req.params.willId);
      const contactId = parseInt(req.params.contactId);
      
      const will = await dbStorage.getWillById(willId);
      
      if (!will) {
        return res.status(404).json({ error: "Will not found" });
      }
      
      // Security check - only allow updates to user's own wills
      if (will.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const updatedContact = await dbStorage.updateWillContact(contactId, req.body);
      return res.status(200).json(updatedContact);
    } catch (error) {
      console.error("Error updating will contact:", error);
      return res.status(500).json({ error: "Failed to update will contact" });
    }
  });
  
  // Delete contact from a will
  app.delete("/api/wills/:willId/contacts/:contactId", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const willId = parseInt(req.params.willId);
      const contactId = parseInt(req.params.contactId);
      
      const will = await dbStorage.getWillById(willId);
      
      if (!will) {
        return res.status(404).json({ error: "Will not found" });
      }
      
      // Security check - only allow deletions from user's own wills
      if (will.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      await dbStorage.deleteWillContact(contactId);
      return res.status(200).json({ message: "Contact deleted successfully" });
    } catch (error) {
      console.error("Error deleting will contact:", error);
      return res.status(500).json({ error: "Failed to delete will contact" });
    }
  });
  
  // Skyler context-aware endpoints for full will functionality 
  app.get("/api/skyler/user-context", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      // Get user information and will data for context
      const userWills = await dbStorage.getUserWills(req.user.id);
      
      // Get the first active will for context, if any
      const activeWill = userWills.find(will => will.status !== 'draft');
      
      const context = {
        user: {
          username: req.user!.username,
          fullName: req.user!.fullName,
        },
        wills: {
          count: userWills.length,
          hasActiveWill: !!activeWill,
          activeWill: activeWill ? {
            id: activeWill.id,
            title: activeWill.title,
            templateId: activeWill.templateId,
            status: activeWill.status,
            createdAt: activeWill.createdAt
          } : null
        }
      };
      
      return res.status(200).json(context);
    } catch (error) {
      console.error("Error fetching Skyler context:", error);
      return res.status(500).json({ error: "Failed to fetch context for Skyler" });
    }
  });

  // Check-in Routes

  // Confirm check-in (user is alive)
  app.get("/api/check-in/confirm", async (req: Request, res: Response) => {
    try {
      const { userId, alive, token } = req.query;
      
      if (!userId || !token || alive === undefined) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      // Validate token (in production, properly verify JWT or similar)
      // For now, we're just checking if it exists
      if (!token) {
        return res.status(400).json({ message: "Invalid token" });
      }

      const user = await dbStorage.getUser(Number(userId));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Record check-in response
      await db.insert(checkInResponses).values({
        userId: Number(userId),
        responderEmail: user.username,
        responderType: 'user',
        isAlive: alive === 'true',
      });

      // Update user's last check-in time
      const now = new Date();
      const nextCheckInDue = new Date();
      nextCheckInDue.setDate(now.getDate() + 7); // Next check-in in 7 days

      await db
        .update(users)
        .set({
          lastCheckIn: now,
          nextCheckInDue,
          updatedAt: now
        })
        .where(eq(users.id, Number(userId)));

      // If user is reported deceased, trigger death verification process
      if (alive === 'false') {
        // In a real implementation, this would trigger emails to death verifiers
        // Removed will status update since we no longer have will functionality

        return res.status(200).render('death-reported', {
          message: 'Death reported. The verification process has been initiated.'
        });
      }

      // Otherwise, render a simple confirmation page
      return res.status(200).render('check-in-confirmed', {
        message: 'Check-in confirmed. Thank you!'
      });
    } catch (error) {
      console.error('Check-in error:', error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Beneficiary/Executor check-in confirmation (similar logic)
  app.get("/api/check-in/:type/confirm", async (req: Request, res: Response) => {
    try {
      const { userId, alive, token } = req.query;
      const { type } = req.params; // 'beneficiary' or 'executor'
      
      if (!userId || !token || alive === undefined || !['beneficiary', 'executor'].includes(type)) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      // The rest of the logic is similar to the user check-in route
      // We would validate the token, record the response, etc.
      
      return res.status(200).json({ message: `${type} check-in confirmed` });
    } catch (error) {
      console.error(`${req.params.type} check-in error:`, error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Manual trigger for check-in emails (for testing/development)
  if (process.env.NODE_ENV === 'development') {
    app.post("/api/trigger-check-in", async (req: Request, res: Response) => {
      try {
        await triggerCheckInEmails();
        return res.status(200).json({ message: "Check-in emails triggered successfully" });
      } catch (error) {
        console.error('Error triggering check-in emails:', error);
        return res.status(500).json({ message: "Server error" });
      }
    });
    
    // Test email route
    app.post("/api/test-email", async (req: Request, res: Response) => {
      try {
        const { email } = req.body;
        
        if (!email) {
          return res.status(400).json({ message: "Email address is required" });
        }
        
        // Generate a test verification code
        const testCode = "123456";
        
        // Send a test email using the verification email template
        const result = await sendEmail(
          email,
          "WillTank Email Test",
          createVerificationEmailTemplate(testCode)
        );
        
        if (result.success) {
          return res.status(200).json({ 
            message: result.message,
            details: result.details || (process.env.EMAIL_TEST_MODE === 'true' 
              ? "This is a test email that was not actually sent. View it at the preview URL below." 
              : "Check your inbox for a verification code email"),
            previewUrl: result.previewUrl
          });
        } else {
          return res.status(500).json({ 
            message: result.message,
            details: result.details || "Check server logs for more details" 
          });
        }
      } catch (error) {
        console.error('Error sending test email:', error);
        return res.status(500).json({ 
          message: "Server error", 
          details: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    });
  }

  // Stripe payment API endpoints
  
  // Get subscription plans endpoint
  app.get("/api/subscription/plans", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      // Return the pricing plans with their details
      const plans = [
        {
          id: 'starter',
          name: 'Starter',
          description: 'Basic Will creation only',
          prices: {
            month: 14.99,
            year: 149.99,
            lifetime: 299
          },
          features: [
            'Basic will creation',
            'Document storage up to 100MB',
            'Email support'
          ]
        },
        {
          id: 'gold',
          name: 'Gold',
          description: 'Multiple wills and advanced features',
          prices: {
            month: 29,
            year: 290,
            lifetime: 599
          },
          features: [
            'Everything in Starter',
            'Multiple wills',
            'Advanced templates',
            'Document storage up to 1GB',
            'Priority email support'
          ]
        },
        {
          id: 'platinum',
          name: 'Platinum',
          description: 'Full platform access',
          prices: {
            month: 55,
            year: 550,
            lifetime: 999
          },
          features: [
            'Everything in Gold',
            'Unlimited wills',
            'Custom templates',
            'Document storage up to 10GB',
            'Phone support',
            'Legacy planning consultation'
          ]
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          description: 'Custom features + 24/7 support',
          prices: {
            month: 'Custom',
            year: 'Custom',
            lifetime: 'Custom'
          },
          features: [
            'Everything in Platinum',
            'Custom integrations',
            'Dedicated account manager',
            'On-site training',
            '24/7 support'
          ]
        }
      ];
      
      return res.status(200).json(plans);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return res.status(500).json({ error: 'Failed to fetch subscription plans' });
    }
  });

  // Get current user subscription
  app.get("/api/subscription", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      
      // Get user with subscription info
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Format subscription info for client
      const subscription = {
        planType: user.planType || 'free',
        planInterval: user.planInterval || null,
        status: user.subscriptionStatus || 'inactive',
        hasActiveSubscription: !!user.stripeSubscriptionId && user.subscriptionStatus === 'active',
        planExpiry: user.planExpiry || null
      };
      
      return res.status(200).json(subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return res.status(500).json({ error: 'Failed to fetch subscription' });
    }
  });

  // Create checkout session for subscription
  app.post("/api/subscription/checkout", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const { planType, interval, successUrl, cancelUrl } = req.body;
      
      if (!planType || !interval || !successUrl || !cancelUrl) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      // For enterprise plans, we return a special response
      if (planType === 'enterprise') {
        return res.status(200).json({ 
          type: 'enterprise',
          message: 'Please contact our sales team for enterprise plans'
        });
      }
      
      // Create checkout session
      const session = await createCheckoutSession(
        userId,
        planType as PlanType,
        interval as PricingInterval,
        successUrl,
        cancelUrl
      );
      
      return res.status(200).json({
        sessionId: session.id,
        url: session.url
      });
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      return res.status(500).json({ error: error.message || 'Failed to create checkout session' });
    }
  });

  // Create billing portal session
  app.post("/api/subscription/portal", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const { returnUrl } = req.body;
      
      if (!returnUrl) {
        return res.status(400).json({ error: "Missing return URL" });
      }
      
      // Create portal session
      const session = await createBillingPortalSession(userId, returnUrl);
      
      return res.status(200).json({
        url: session.url
      });
    } catch (error: any) {
      console.error('Error creating billing portal session:', error);
      return res.status(500).json({ error: error.message || 'Failed to create billing portal session' });
    }
  });

  // Cancel subscription
  app.post("/api/subscription/cancel", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      
      // Cancel subscription
      await cancelSubscription(userId);
      
      return res.status(200).json({
        success: true,
        message: 'Subscription will be canceled at the end of the billing period'
      });
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      return res.status(500).json({ error: error.message || 'Failed to cancel subscription' });
    }
  });

  // Webhook to handle Stripe events
  app.post("/api/webhook/stripe", express.raw({type: 'application/json'}), async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      return res.status(400).json({ error: 'Missing Stripe signature' });
    }

    try {
      // For security, we should verify the webhook signature using a webhook secret
      // In a production environment, you would use:
      // const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
      
      // For now, we'll just parse the event
      const event = JSON.parse(req.body.toString());
      
      // Handle different event types
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          
          // Extract metadata from session
          const userId = Number(session.metadata?.userId);
          const planType = session.metadata?.planType as PlanType;
          const interval = session.metadata?.interval as PricingInterval;
          
          if (userId && planType && interval) {
            if (interval === 'lifetime') {
              // For lifetime plans, update user with plan info but no subscription
              await db
                .update(users)
                .set({
                  planType,
                  planInterval: interval,
                  subscriptionStatus: 'active',
                  planExpiry: null, // Lifetime doesn't expire
                  updatedAt: new Date()
                })
                .where(eq(users.id, userId));
                
              // Create notification for subscription activation
              try {
                await NotificationEvents.SUBSCRIPTION_ACTIVATED(userId, planType);
              } catch (notificationError) {
                console.error("Failed to create notification for subscription activation:", notificationError);
              }
            } else if (session.subscription) {
              // For recurring plans, update with subscription ID
              await updateUserSubscription(
                userId,
                session.subscription as string,
                planType,
                interval,
                'active'
              );
              
              // Create notification for subscription activation
              try {
                await NotificationEvents.SUBSCRIPTION_ACTIVATED(userId, planType);
              } catch (notificationError) {
                console.error("Failed to create notification for subscription activation:", notificationError);
              }
            }
          }
          break;
          
        case 'customer.subscription.updated':
          const subscription = event.data.object;
          
          // Handle subscription updates like renewal
          try {
            // Get user ID by Stripe customer ID
            const [user] = await db
              .select()
              .from(users)
              .where(eq(users.stripeCustomerId, subscription.customer as string));
              
            if (user) {
              // Check for renewal (this could be expanded based on Stripe event data)
              if (subscription.status === 'active') {
                try {
                  await NotificationEvents.SUBSCRIPTION_RENEWED(user.id, user.planType || 'subscription');
                } catch (notificationError) {
                  console.error("Failed to create notification for subscription renewal:", notificationError);
                }
              }
            }
          } catch (error) {
            console.error("Error handling subscription update:", error);
          }
          
          break;
          
        case 'customer.subscription.deleted':
          // Handle subscription cancellation logic
          break;
          
        case 'invoice.payment_succeeded':
          const successfulInvoice = event.data.object;
          try {
            // Get user ID by Stripe customer ID
            const [user] = await db
              .select()
              .from(users)
              .where(eq(users.stripeCustomerId, successfulInvoice.customer as string));
              
            if (user) {
              try {
                await NotificationEvents.PAYMENT_RECEIVED(user.id, user.planType || 'subscription');
              } catch (notificationError) {
                console.error("Failed to create notification for payment success:", notificationError);
              }
            }
          } catch (error) {
            console.error("Error handling payment success:", error);
          }
          break;
          
        case 'customer.source.updated':
        case 'payment_method.attached':
          // Handler for payment method update events
          const paymentObject = event.data.object;
          try {
            // Get user ID by Stripe customer ID
            const [user] = await db
              .select()
              .from(users)
              .where(eq(users.stripeCustomerId, paymentObject.customer as string));
              
            if (user) {
              try {
                await NotificationEvents.PAYMENT_METHOD_UPDATED(user.id);
              } catch (notificationError) {
                console.error("Failed to create notification for payment method update:", notificationError);
              }
            }
          } catch (error) {
            console.error("Error handling payment method update:", error);
          }
          break;
          
        case 'invoice.payment_failed':
          const failedInvoice = event.data.object;
          try {
            // Get user ID by Stripe customer ID
            const [user] = await db
              .select()
              .from(users)
              .where(eq(users.stripeCustomerId, failedInvoice.customer as string));
              
            if (user) {
              try {
                await NotificationEvents.PAYMENT_FAILED(user.id, user.planType || 'subscription');
              } catch (notificationError) {
                console.error("Failed to create notification for payment failure:", notificationError);
              }
            }
          } catch (error) {
            console.error("Error handling payment failure:", error);
          }
          break;
      }
      
      return res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Error handling webhook:', error);
      return res.status(400).json({ error: error.message });
    }
  });

  // Create a support request for enterprise plan
  app.post("/api/support/enterprise", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const { name, email, phone, company, message } = req.body;
      
      if (!name || !email || !message) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // In a production environment, you would send this information to your sales team
      // For now, we'll just log it
      console.log('Enterprise support request:', {
        userId,
        name,
        email,
        phone,
        company,
        message
      });
      
      // You could send an email here using the existing email system
      
      // Create notification for support request
      try {
        await NotificationEvents.SUPPORT_REQUEST_SENT(userId);
      } catch (notificationError) {
        console.error("Failed to create notification for support request:", notificationError);
        // Continue with response even if notification creation fails
      }
      
      return res.status(200).json({
        success: true,
        message: 'Your request has been submitted. Our team will contact you shortly.'
      });
    } catch (error) {
      console.error('Error submitting enterprise request:', error);
      return res.status(500).json({ error: 'Failed to submit enterprise request' });
    }
  });

  // Two-Factor Authentication (2FA) API endpoints
  app.get("/api/2fa/status", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const status = await get2FAStatus(userId);
      
      return res.status(200).json({
        enabled: status.enabled,
        // Don't send secret if already enabled for security
        hasTwoFactorSecret: !!status.secret
      });
    } catch (error) {
      console.error("Error getting 2FA status:", error);
      return res.status(500).json({ error: "Failed to get 2FA status" });
    }
  });
  
  app.post("/api/2fa/generate", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const username = req.user!.username;
      
      // Check if 2FA is already enabled
      const status = await get2FAStatus(userId);
      if (status.enabled) {
        return res.status(400).json({ error: "2FA is already enabled" });
      }
      
      // Generate a new secret for the user
      const { secret, qrCodeUrl } = generateSecret(username);
      
      // Temporarily store secret in database but don't enable 2FA yet
      // Will be verified before enabling
      await db.update(users)
        .set({ twoFactorSecret: secret.base32 })
        .where(eq(users.id, userId));
      
      // Return the secret and QR code URL to be verified
      const response = await qrCodeUrl;
      return res.status(200).json({
        secret: secret.base32,
        qrCode: response,
        otpAuthUrl: secret.otpauth_url
      });
    } catch (error) {
      console.error("Error generating 2FA secret:", error);
      return res.status(500).json({ error: "Failed to generate 2FA secret" });
    }
  });
  
  app.post("/api/2fa/verify", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: "Token is required" });
      }
      
      // Get user's current 2FA status
      const status = await get2FAStatus(userId);
      
      // If already enabled, return error
      if (status.enabled) {
        return res.status(400).json({ error: "2FA is already enabled" });
      }
      
      // Verify the token against the stored secret
      if (!status.secret) {
        return res.status(400).json({ error: "No 2FA secret found. Generate a new secret first." });
      }
      
      const isValid = verifyToken(token, status.secret);
      
      if (!isValid) {
        return res.status(400).json({ error: "Invalid token" });
      }
      
      // Enable 2FA for the user
      await enable2FA(userId, status.secret);
      
      // Get updated status with backup codes
      let updatedStatus;
      try {
        updatedStatus = await get2FAStatus(userId);
      } catch (statusError) {
        console.error("Error getting updated 2FA status:", statusError);
        // Continue even if we can't get backup codes
      }
      
      // Create notification for 2FA enablement
      try {
        await NotificationEvents.SECURITY_2FA_ENABLED(userId);
      } catch (notificationError) {
        console.error("Failed to create notification for 2FA enablement:", notificationError);
        // Continue with response even if notification creation fails
      }
      
      return res.status(200).json({
        success: true,
        message: "Two-factor authentication enabled successfully",
        backupCodes: updatedStatus?.backupCodes || []
      });
    } catch (error) {
      console.error("Error verifying 2FA token:", error);
      return res.status(500).json({ error: "Failed to verify 2FA token" });
    }
  });
  
  app.post("/api/2fa/disable", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const { password, token } = req.body;
      
      // Get current user record to verify password
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Get 2FA status
      const status = await get2FAStatus(userId);
      
      if (!status.enabled) {
        return res.status(400).json({ error: "2FA is not enabled" });
      }
      
      // Verify password
      // Use imported bcrypt instead of require
      const isPasswordValid = await comparePasswords(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid password" });
      }
      
      // Verify token if secret exists
      if (status.secret && token) {
        const isTokenValid = verifyToken(token, status.secret);
        if (!isTokenValid) {
          return res.status(400).json({ error: "Invalid 2FA token" });
        }
      }
      
      // Disable 2FA
      await disable2FA(userId);
      
      // Create notification for 2FA disablement
      try {
        await NotificationEvents.SECURITY_2FA_DISABLED(userId);
      } catch (notificationError) {
        console.error("Failed to create notification for 2FA disablement:", notificationError);
        // Continue with response even if notification creation fails
      }
      
      return res.status(200).json({
        success: true,
        message: "Two-factor authentication disabled successfully"
      });
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      return res.status(500).json({ error: "Failed to disable 2FA" });
    }
  });
  
  app.post("/api/2fa/verify-token", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: "Token is required" });
      }
      
      // Get user's current 2FA status
      const status = await get2FAStatus(userId);
      
      if (!status.enabled || !status.secret) {
        return res.status(400).json({ error: "2FA is not enabled" });
      }
      
      // Verify the token
      const isValid = verifyToken(token, status.secret);
      
      return res.status(200).json({
        valid: isValid
      });
    } catch (error) {
      console.error("Error verifying 2FA token:", error);
      return res.status(500).json({ error: "Failed to verify 2FA token" });
    }
  });
  
  // Notification API endpoints
  app.get("/api/notifications", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const notifications = await dbStorage.getUserNotifications(userId);
      return res.status(200).json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread-count", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const count = await dbStorage.getUserUnreadNotificationCount(userId);
      return res.status(200).json({ count });
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      return res.status(500).json({ error: "Failed to fetch unread notification count" });
    }
  });

  app.post("/api/notifications/mark-read/:id", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const notificationId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Get notification to verify ownership
      const [notification] = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, notificationId));
      
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      
      if (notification.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized access to notification" });
      }
      
      const updatedNotification = await dbStorage.markNotificationAsRead(notificationId);
      return res.status(200).json(updatedNotification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/mark-all-read", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      await dbStorage.markAllUserNotificationsAsRead(userId);
      return res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
  });

  app.delete("/api/notifications/:id", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const notificationId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Get notification to verify ownership
      const [notification] = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, notificationId));
      
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      
      if (notification.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized access to notification" });
      }
      
      await dbStorage.deleteNotification(notificationId);
      return res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      return res.status(500).json({ error: "Failed to delete notification" });
    }
  });

  // Helper function to create a notification
  app.post("/api/notifications", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const validatedData = insertNotificationSchema.parse({
        ...req.body,
        userId
      });
      
      const newNotification = await dbStorage.createNotification(validatedData);
      return res.status(201).json(newNotification);
    } catch (error) {
      console.error("Error creating notification:", error);
      return res.status(500).json({ error: "Failed to create notification" });
    }
  });

  // Delivery Settings routes
  app.get("/api/delivery-settings", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      
      // Get the user's delivery settings
      const [settings] = await db
        .select()
        .from(deliverySettings)
        .where(eq(deliverySettings.userId, userId));
      
      if (!settings) {
        return res.status(200).json({
          method: '',
          contacts: [],
          message: '',
          attorneyContact: null
        });
      }
      
      return res.status(200).json(settings);
    } catch (error) {
      console.error('Error fetching delivery settings:', error);
      return res.status(500).json({ error: 'Failed to fetch delivery settings' });
    }
  });

  app.post("/api/delivery-settings", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Type assertion to ensure req.user is not undefined after authentication check
      const userId = req.user!.id;
      const { method, contacts, message, attorneyContact } = req.body;
      
      // Check if delivery settings already exist for this user
      const [existingSettings] = await db
        .select()
        .from(deliverySettings)
        .where(eq(deliverySettings.userId, userId));
      
      let result;
      
      if (existingSettings) {
        // Update existing settings
        [result] = await db
          .update(deliverySettings)
          .set({
            method,
            contacts,
            message,
            attorneyContact,
            updatedAt: new Date()
          })
          .where(eq(deliverySettings.userId, userId))
          .returning();
      } else {
        // Create new settings
        [result] = await db
          .insert(deliverySettings)
          .values({
            userId,
            method,
            contacts,
            message,
            attorneyContact,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error saving delivery settings:', error);
      return res.status(500).json({ error: 'Failed to save delivery settings' });
    }
  });

  // Beneficiaries API routes
  app.get("/api/beneficiaries", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const beneficiariesData = await db
        .select()
        .from(beneficiaries)
        .where(eq(beneficiaries.userId, userId));
      
      // Map DB model to client expected format
      const mappedBeneficiaries = beneficiariesData.map(b => ({
        id: b.id.toString(),
        name: b.fullName,
        relationship: b.relationship,
        email: b.email,
        phone: b.phone || undefined,
        location: '', // Not in DB schema but expected by client
        share: '', // Not in DB schema but expected by client
        willId: undefined,
        userId: b.userId
      }));
      
      return res.status(200).json(mappedBeneficiaries);
    } catch (error) {
      console.error("Error fetching beneficiaries:", error);
      return res.status(500).json({ error: "Failed to fetch beneficiaries" });
    }
  });

  app.post("/api/beneficiaries", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const { name, relationship, email, phone } = req.body;
      
      const [newBeneficiary] = await db.insert(beneficiaries).values({
        userId: userId,
        fullName: name,
        relationship,
        email,
        phone: phone || null,
        status: 'pending'
      }).returning();
      
      // Map to client expected format
      const mappedBeneficiary = {
        id: newBeneficiary.id.toString(),
        name: newBeneficiary.fullName,
        relationship: newBeneficiary.relationship,
        email: newBeneficiary.email,
        phone: newBeneficiary.phone || undefined,
        location: '', // Not in DB schema but expected by client
        share: '', // Not in DB schema but expected by client
        userId: newBeneficiary.userId
      };
      
      return res.status(201).json(mappedBeneficiary);
    } catch (error) {
      console.error("Error creating beneficiary:", error);
      return res.status(500).json({ error: "Failed to create beneficiary" });
    }
  });

  app.put("/api/beneficiaries/:id", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { name, relationship, email, phone } = req.body;
      
      // Verify ownership
      const beneficiary = await db.select().from(beneficiaries)
        .where(and(
          eq(beneficiaries.id, parseInt(id)),
          eq(beneficiaries.userId, userId)
        ));
      
      if (beneficiary.length === 0) {
        return res.status(404).json({ error: "Beneficiary not found" });
      }
      
      const [updatedBeneficiary] = await db.update(beneficiaries)
        .set({
          fullName: name,
          relationship,
          email,
          phone: phone || null,
          updatedAt: new Date()
        })
        .where(eq(beneficiaries.id, parseInt(id)))
        .returning();
      
      // Map to client expected format
      const mappedBeneficiary = {
        id: updatedBeneficiary.id.toString(),
        name: updatedBeneficiary.fullName,
        relationship: updatedBeneficiary.relationship,
        email: updatedBeneficiary.email,
        phone: updatedBeneficiary.phone || undefined,
        location: '', // Not in DB schema but expected by client
        share: '', // Not in DB schema but expected by client
        userId: updatedBeneficiary.userId
      };
      
      return res.status(200).json(mappedBeneficiary);
    } catch (error) {
      console.error("Error updating beneficiary:", error);
      return res.status(500).json({ error: "Failed to update beneficiary" });
    }
  });

  app.delete("/api/beneficiaries/:id", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const { id } = req.params;
      
      // Verify ownership
      const beneficiary = await db.select().from(beneficiaries)
        .where(and(
          eq(beneficiaries.id, parseInt(id)),
          eq(beneficiaries.userId, userId)
        ));
      
      if (beneficiary.length === 0) {
        return res.status(404).json({ error: "Beneficiary not found" });
      }
      
      await db.delete(beneficiaries)
        .where(eq(beneficiaries.id, parseInt(id)));
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting beneficiary:", error);
      return res.status(500).json({ error: "Failed to delete beneficiary" });
    }
  });

  // User profile management routes - removed will functionality
  
  app.post("/api/user/update-profile", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const updates = req.body;
      
      // Update user profile with provided data
      const user = await dbStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Update user in database
      const [updatedUser] = await db.update(users)
        .set(updates)
        .where(eq(users.id, userId))
        .returning();
      
      // Removed will-related notification logic
      
      // For backward compatibility, also maintain onboarding endpoints
      return res.status(200).json({ 
        message: "Profile updated successfully",
        user: updatedUser,
        success: true
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      return res.status(500).json({ error: "Failed to update user profile" });
    }
  });
  
  // Onboarding endpoints for backward compatibility but without will functionality
  app.get("/api/onboarding/status", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const user = await dbStorage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // All users now considered onboarded since we don't have will creation journey
      return res.status(200).json({
        hasCompletedOnboarding: true
      });
    } catch (error) {
      console.error("Error fetching onboarding status:", error);
      return res.status(500).json({ error: "Failed to fetch onboarding status" });
    }
  });
  
  app.post("/api/onboarding/complete", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const { profile } = req.body;
      
      // Only update user preferences if provided
      const updates: any = {};
      if (profile) {
        updates.preferences = profile;
      }
      
      // Update user in database if there are any updates to make
      let updatedUser = req.user;
      if (Object.keys(updates).length > 0) {
        [updatedUser] = await db.update(users)
          .set(updates)
          .where(eq(users.id, userId))
          .returning();
      }
      
      return res.status(200).json({
        message: "Profile updated successfully",
        hasCompletedOnboarding: true,
        fullName: updatedUser.fullName
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      return res.status(500).json({ error: "Failed to update user profile" });
    }
  });

  // Reminders endpoints
  app.get("/api/reminders", async (req: Request, res: Response) => {
    try {
      if (!isUserAuthenticated(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userId = req.user!.id;
      
      const userReminders = await db.select()
        .from(reminders)
        .where(eq(reminders.userId, userId))
        .orderBy(reminders.date, reminders.time);
      
      return res.status(200).json(userReminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/reminders", async (req: Request, res: Response) => {
    try {
      if (!isUserAuthenticated(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userId = req.user!.id;
      const reminderData = req.body;
      
      // Validate required fields
      if (!reminderData.title || !reminderData.date) {
        return res.status(400).json({ error: "Title and date are required" });
      }
      
      // Create new reminder
      const [newReminder] = await db.insert(reminders)
        .values({
          userId,
          title: reminderData.title,
          description: reminderData.description,
          date: reminderData.date, // Store as string to avoid timezone issues
          time: reminderData.time,
          repeat: reminderData.repeat || "never",
          completed: reminderData.completed || false
        })
        .returning();
      
      return res.status(201).json(newReminder);
    } catch (error) {
      console.error("Error creating reminder:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });

  app.put("/api/reminders/:id", async (req: Request, res: Response) => {
    try {
      if (!isUserAuthenticated(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userId = req.user!.id;
      const reminderId = parseInt(req.params.id);
      const reminderData = req.body;
      
      // Validate reminder exists and belongs to user
      const existingReminder = await db.select()
        .from(reminders)
        .where(and(
          eq(reminders.id, reminderId),
          eq(reminders.userId, userId)
        ));
      
      if (existingReminder.length === 0) {
        return res.status(404).json({ error: "Reminder not found" });
      }
      
      // Update reminder
      const [updatedReminder] = await db.update(reminders)
        .set({
          title: reminderData.title,
          description: reminderData.description,
          date: reminderData.date, // Store as string to avoid timezone issues
          time: reminderData.time,
          repeat: reminderData.repeat,
          completed: reminderData.completed !== undefined ? reminderData.completed : undefined,
          updatedAt: new Date()
        })
        .where(eq(reminders.id, reminderId))
        .returning();
      
      return res.status(200).json(updatedReminder);
    } catch (error) {
      console.error("Error updating reminder:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });

  app.delete("/api/reminders/:id", async (req: Request, res: Response) => {
    try {
      if (!isUserAuthenticated(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userId = req.user!.id;
      const reminderId = parseInt(req.params.id);
      
      // Validate reminder exists and belongs to user
      const existingReminder = await db.select()
        .from(reminders)
        .where(and(
          eq(reminders.id, reminderId),
          eq(reminders.userId, userId)
        ));
      
      if (existingReminder.length === 0) {
        return res.status(404).json({ error: "Reminder not found" });
      }
      
      // Delete reminder
      await db.delete(reminders)
        .where(eq(reminders.id, reminderId));
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting reminder:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });

  // This endpoint is kept for backward compatibility
  // but will always return that will creation is completed
  app.post("/api/user/will-status", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    // We no longer have will functionality, so just return success for backward compatibility
    return res.status(200).json({ 
      success: true, 
      message: "Status updated successfully",
      hasCompletedOnboarding: true
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
