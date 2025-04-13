import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { initializeScheduler, triggerCheckInEmails } from "./scheduler";
import { storage as dbStorage } from "./storage";
import { db } from "./db";
import { checkInResponses, users, wills, willDocuments } from "@shared/schema";
import { eq } from "drizzle-orm";
import { sendEmail, createVerificationEmailTemplate } from "./email";
import multer from "multer";
import path from "path";
import fs from "fs";
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

// Helper function to check if a user is authenticated via session
// Uses passport's req.isAuthenticated() method which is more reliable
function isUserAuthenticated(req: Request): boolean {
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
  
  // Will API endpoints
  app.get("/api/wills", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const userWills = await dbStorage.getWillsByUserId(userId);
      
      return res.status(200).json(userWills);
    } catch (error) {
      console.error("Error fetching wills:", error);
      return res.status(500).json({ error: "Failed to fetch wills" });
    }
  });
  
  app.get("/api/wills/:id", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const willId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      const will = await dbStorage.getWillById(willId);
      
      if (!will) {
        return res.status(404).json({ error: "Will not found" });
      }
      
      // Security check: ensure will belongs to current user
      if (will.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized access to will" });
      }
      
      return res.status(200).json(will);
    } catch (error) {
      console.error("Error fetching will:", error);
      return res.status(500).json({ error: "Failed to fetch will details" });
    }
  });
  
  app.post("/api/wills", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const { templateId, title, content } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
      }
      
      const newWill = await dbStorage.createWill({
        userId,
        templateId,
        title,
        content,
        status: "draft"
      });
      
      return res.status(201).json(newWill);
    } catch (error) {
      console.error("Error creating will:", error);
      return res.status(500).json({ error: "Failed to create will" });
    }
  });
  
  app.put("/api/wills/:id", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const willId = parseInt(req.params.id);
      const userId = req.user!.id;
      const { title, content, status } = req.body;
      
      // Check if will exists and belongs to user
      const existingWill = await dbStorage.getWillById(willId);
      
      if (!existingWill) {
        return res.status(404).json({ error: "Will not found" });
      }
      
      if (existingWill.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized access to will" });
      }
      
      const updatedWill = await dbStorage.updateWill(willId, {
        title,
        content,
        status,
        lastUpdated: new Date()
      });
      
      return res.status(200).json(updatedWill);
    } catch (error) {
      console.error("Error updating will:", error);
      return res.status(500).json({ error: "Failed to update will" });
    }
  });
  
  // Document API endpoints
  app.get("/api/wills/:willId/documents", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const willId = parseInt(req.params.willId);
      const userId = req.user!.id;
      
      // Check if will belongs to user
      const will = await dbStorage.getWillById(willId);
      
      if (!will) {
        return res.status(404).json({ error: "Will not found" });
      }
      
      if (will.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized access to will documents" });
      }
      
      const documents = await dbStorage.getWillDocuments(willId);
      
      return res.status(200).json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      return res.status(500).json({ error: "Failed to fetch documents" });
    }
  });
  
  app.post("/api/wills/:willId/documents", upload.single('file'), async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const willId = parseInt(req.params.willId);
      const userId = req.user!.id;
      
      // Check if will belongs to user
      const will = await dbStorage.getWillById(willId);
      
      if (!will) {
        // Remove uploaded file if will doesn't exist
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ error: "Will not found" });
      }
      
      if (will.userId !== userId) {
        // Remove uploaded file if user doesn't own the will
        fs.unlinkSync(req.file.path);
        return res.status(403).json({ error: "Unauthorized access to will" });
      }
      
      // Calculate relative file URL path
      const fileUrl = `/uploads/${path.basename(req.file.path)}`;
      
      // Add document to database
      const newDocument = await dbStorage.addWillDocument({
        willId,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        fileUrl
      });
      
      return res.status(201).json(newDocument);
    } catch (error) {
      console.error("Error uploading document:", error);
      // Clean up file if it was uploaded
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({ error: "Failed to upload document" });
    }
  });
  
  app.delete("/api/documents/:id", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const documentId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Get document
      const [document] = await db
        .select()
        .from(willDocuments)
        .where(eq(willDocuments.id, documentId));
      
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      // Get will to check ownership
      const will = await dbStorage.getWillById(document.willId);
      
      if (!will || will.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized access to document" });
      }
      
      // Delete file from filesystem
      const filePath = path.join(process.cwd(), document.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Delete from database
      await dbStorage.deleteWillDocument(documentId);
      
      return res.status(200).json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      return res.status(500).json({ error: "Failed to delete document" });
    }
  });
  
  // Will template endpoints
  app.get("/api/will-templates", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const templates = await dbStorage.getWillTemplates();
      return res.status(200).json(templates);
    } catch (error) {
      console.error("Error fetching will templates:", error);
      return res.status(500).json({ error: "Failed to fetch will templates" });
    }
  });
  
  app.get("/api/will-templates/:id", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const templateId = parseInt(req.params.id);
      const template = await dbStorage.getWillTemplateById(templateId);
      
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      return res.status(200).json(template);
    } catch (error) {
      console.error("Error fetching will template:", error);
      return res.status(500).json({ error: "Failed to fetch will template" });
    }
  });
  
  // Skyler context-aware endpoints
  app.get("/api/skyler/user-context", async (req: Request, res: Response) => {
    if (!isUserAuthenticated(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      
      // Get user's wills to provide context for Skyler
      const userWills = await dbStorage.getWillsByUserId(userId);
      
      // Get only relevant information for context
      const context = {
        user: {
          username: req.user!.username,
          fullName: req.user!.fullName,
        },
        wills: userWills.map(will => ({
          id: will.id,
          title: will.title,
          status: will.status,
          lastUpdated: will.lastUpdated,
          createdAt: will.createdAt
        }))
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
        // and set the will status to pending verification
        await db
          .update(wills)
          .set({
            status: 'pending_verification'
          })
          .where(eq(wills.userId, Number(userId)));

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

  const httpServer = createServer(app);

  return httpServer;
}
