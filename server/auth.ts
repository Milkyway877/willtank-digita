import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, extendedInsertUserSchema } from "@shared/schema";
import { z } from "zod";
import { sendEmail, createVerificationEmailTemplate, createPasswordResetEmailTemplate } from "./email";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Generate a secure random verification code
export function generateVerificationCode(length = 6): string {
  return Array.from(
    { length },
    () => Math.floor(Math.random() * 10).toString()
  ).join("");
}

// Generate a secure reset token
function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Send verification email using the email service
async function sendVerificationEmail(email: string, code: string) {
  try {
    console.log(`Sending verification email to ${email} with code: ${code}`);
    const subject = "Verify Your WillTank Account";
    const htmlContent = createVerificationEmailTemplate(code);
    
    const result = await sendEmail(email, subject, htmlContent);
    return result;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
}

// Send password reset email using the email service
async function sendPasswordResetEmail(email: string, token: string) {
  try {
    console.log(`Sending password reset email to ${email}`);
    const subject = "Reset Your WillTank Password";
    const htmlContent = createPasswordResetEmailTemplate(token);
    
    const result = await sendEmail(email, subject, htmlContent);
    return result;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "willtank-secure-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        // If user doesn't exist or password doesn't match
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid email or password" });
        }
        
        // Check if email is verified
        if (!user.isEmailVerified) {
          return done(null, false, { message: "Please verify your email before logging in" });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // ===== User Registration =====
  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate input using Zod
      const validatedData = extendedInsertUserSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validatedData.error.errors
        });
      }

      const { username, password } = validatedData.data;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Create user without auto-login
      const user = await storage.createUser({
        username: username.toLowerCase(), // Store email in lowercase
        password: await hashPassword(password),
      });

      // Generate verification code
      const verificationCode = generateVerificationCode();
      await storage.setVerificationCode(user.id, verificationCode, 30); // 30 minutes expiry

      // Send verification email
      sendVerificationEmail(user.username, verificationCode);

      // Return user data without auto-login
      return res.status(201).json({ 
        id: user.id,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
        message: "Registration successful. Please check your email for verification code."
      });
    } catch (err) {
      next(err);
    }
  });

  // ===== Email Verification =====
  app.post("/api/verify-email", async (req, res, next) => {
    try {
      const { email, code } = req.body;
      
      if (!email || !code) {
        return res.status(400).json({ message: "Email and verification code are required" });
      }

      // Find user by email
      const user = await storage.getUserByUsername(email.toLowerCase());
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user is already verified
      if (user.isEmailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      // Validate verification code
      if (user.verificationCode !== code) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      // Check if code is expired
      const now = new Date();
      if (user.verificationCodeExpiry && now > user.verificationCodeExpiry) {
        return res.status(400).json({ message: "Verification code expired" });
      }

      // Mark email as verified
      const updatedUser = await storage.verifyEmail(user.id);

      // Auto-login the user
      req.login(updatedUser, (err) => {
        if (err) return next(err);
        return res.status(200).json({ 
          ...updatedUser,
          message: "Email verified successfully" 
        });
      });
    } catch (err) {
      next(err);
    }
  });

  // ===== Resend Verification Code =====
  app.post("/api/resend-verification", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Find user by email
      const user = await storage.getUserByUsername(email.toLowerCase());
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if already verified
      if (user.isEmailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      // Generate and save new verification code
      const verificationCode = generateVerificationCode();
      await storage.setVerificationCode(user.id, verificationCode, 30);

      // Send verification email
      sendVerificationEmail(user.username, verificationCode);

      return res.status(200).json({ message: "Verification code sent successfully" });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // ===== Login =====
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message?: string }) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Authentication failed" });
      
      req.login(user, (loginErr: Error | null) => {
        if (loginErr) return next(loginErr);
        return res.status(200).json({
          id: user.id,
          username: user.username,
          isEmailVerified: user.isEmailVerified
        });
      });
    })(req, res, next);
  });

  // ===== Forgot Password =====
  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Find user by email
      const user = await storage.getUserByUsername(email.toLowerCase());
      if (!user) {
        // For security reasons, don't reveal if user doesn't exist
        return res.status(200).json({ message: "If your email is registered, you will receive a password reset link" });
      }

      // Generate reset token
      const resetToken = generateResetToken();
      await storage.setResetToken(user.id, resetToken, 60); // 1 hour expiry

      // Send password reset email
      sendPasswordResetEmail(user.username, resetToken);

      return res.status(200).json({ message: "Password reset instructions sent to your email" });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // ===== Reset Password =====
  app.post("/api/reset-password", async (req, res, next) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      // Validate password
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      // Find user by reset token
      const user = await storage.getUserByResetToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      // Update password
      const hashedPassword = await hashPassword(password);
      const updatedUser = await storage.updatePassword(user.id, hashedPassword);

      // Auto-login the user
      req.login(updatedUser, (err) => {
        if (err) return next(err);
        return res.status(200).json({ message: "Password reset successful" });
      });
    } catch (err) {
      next(err);
    }
  });

  // ===== Logout =====
  app.post("/api/logout", (req, res, next) => {
    req.logout((err: Error | null) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // ===== Get Current User =====
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    // Return user data without sensitive fields
    const user = req.user;
    res.json({
      id: user.id,
      username: user.username,
      isEmailVerified: user.isEmailVerified
    });
  });

  // ===== Change Password (authenticated users) =====
  app.post("/api/change-password", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      // Validate new password
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters long" });
      }

      // Get user
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      if (!(await comparePasswords(currentPassword, user.password))) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Update password
      const hashedPassword = await hashPassword(newPassword);
      await storage.updatePassword(user.id, hashedPassword);

      return res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
      next(err);
    }
  });
}