import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { initializeScheduler, triggerCheckInEmails } from "./scheduler";
import { storage } from "./storage";
import { db } from "./db";
import { checkInResponses, users, wills } from "@shared/schema";
import { eq } from "drizzle-orm";
import { sendEmail, createVerificationEmailTemplate } from "./email";

import { getChatCompletion, getStreamingChatCompletion } from './openai';

// Helper function to check if a user is authenticated via session
function isUserAuthenticated(req: Request): boolean {
  return !!(req.session && (req.session as any).passport?.user);
}

export async function registerRoutes(app: Express): Promise<Server> {
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
  // Set up auth routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Initialize the scheduler for weekly check-ins
  initializeScheduler();

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

      const user = await storage.getUser(Number(userId));
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
