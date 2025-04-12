import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up auth routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Add other application routes here
  // prefix all routes with /api
  
  // Route to update onboarding status
  app.post("/api/user/onboarding", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const { completed } = req.body;
    
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ message: "Invalid request. 'completed' field must be a boolean." });
    }
    
    const userId = req.user!.id;
    
    storage.updateUserOnboardingStatus(userId, completed)
      .then(updatedUser => {
        res.status(200).json(updatedUser);
      })
      .catch(err => {
        next(err);
      });
  });

  const httpServer = createServer(app);

  return httpServer;
}
