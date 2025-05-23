import { storage } from "./storage";
import { type InsertNotification } from "@shared/schema";

/**
 * Create a notification with the given parameters
 */
export async function createNotification({
  userId,
  title,
  message,
  type = "info",
  relatedEntityType = null,
  relatedEntityId = null,
}: InsertNotification) {
  try {
    return await storage.createNotification({
      userId,
      title,
      message,
      type,
      relatedEntityType,
      relatedEntityId,
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    throw error;
  }
}

/**
 * Notification types for specific system events
 */
export const NotificationEvents = {
  // Will-related events
  WILL_CREATED: async (userId: number, willId: number, willTitle: string) => {
    return createNotification({
      userId,
      title: "Will Created",
      message: `Your new will '${willTitle}' has been created successfully.`,
      type: "success",
      relatedEntityType: "will",
      relatedEntityId: willId,
    });
  },
  
  WILL_UPDATED: async (userId: number, willId: number, willTitle: string) => {
    return createNotification({
      userId,
      title: "Will Updated",
      message: `Your will '${willTitle}' has been updated successfully.`,
      type: "info",
      relatedEntityType: "will",
      relatedEntityId: willId,
    });
  },
  
  WILL_COMPLETED: async (userId: number, willId: number, willTitle: string) => {
    return createNotification({
      userId,
      title: "Will Completed",
      message: `Congratulations! Your will '${willTitle}' has been marked as complete.`,
      type: "success",
      relatedEntityType: "will",
      relatedEntityId: willId,
    });
  },
  
  // Document-related events
  DOCUMENT_UPLOADED: async (userId: number, willId: number, fileName: string) => {
    return createNotification({
      userId,
      title: "Document Uploaded",
      message: `Document '${fileName}' has been uploaded and attached to your will.`,
      type: "success",
      relatedEntityType: "document",
      relatedEntityId: willId,
    });
  },
  
  DOCUMENT_DELETED: async (userId: number, willId: number, fileName: string) => {
    return createNotification({
      userId,
      title: "Document Deleted",
      message: `Document '${fileName}' has been removed from your will.`,
      type: "info",
      relatedEntityType: "document",
      relatedEntityId: willId,
    });
  },
  
  // Beneficiary-related events
  BENEFICIARY_ADDED: async (userId: number, beneficiaryName: string) => {
    return createNotification({
      userId,
      title: "Beneficiary Added",
      message: `${beneficiaryName} has been added as a beneficiary to your will.`,
      type: "success",
      relatedEntityType: "beneficiary",
    });
  },
  
  BENEFICIARY_UPDATED: async (userId: number, beneficiaryName: string) => {
    return createNotification({
      userId,
      title: "Beneficiary Updated",
      message: `Information for beneficiary ${beneficiaryName} has been updated.`,
      type: "info",
      relatedEntityType: "beneficiary",
    });
  },
  
  // Subscription-related events
  SUBSCRIPTION_ACTIVATED: async (userId: number, planType: string) => {
    return createNotification({
      userId,
      title: "Subscription Activated",
      message: `Your ${planType} subscription has been activated successfully.`,
      type: "success",
      relatedEntityType: "subscription",
    });
  },
  
  SUBSCRIPTION_RENEWED: async (userId: number, planType: string) => {
    return createNotification({
      userId,
      title: "Subscription Renewed",
      message: `Your ${planType} subscription has been renewed.`,
      type: "info",
      relatedEntityType: "subscription",
    });
  },
  
  SUBSCRIPTION_EXPIRING: async (userId: number, daysLeft: number) => {
    return createNotification({
      userId,
      title: "Subscription Expiring Soon",
      message: `Your subscription will expire in ${daysLeft} days. Please renew to maintain access to all features.`,
      type: "warning",
      relatedEntityType: "subscription",
    });
  },
  
  // System events
  EMAIL_VERIFIED: async (userId: number) => {
    return createNotification({
      userId,
      title: "Email Verified",
      message: "Your email address has been successfully verified.",
      type: "success",
      relatedEntityType: "system",
    });
  },
  
  WELCOME_ONBOARDING_COMPLETE: async (userId: number) => {
    return createNotification({
      userId,
      title: "Welcome to WillTank!",
      message: "Your account is ready. Let's begin creating your first will.",
      type: "success",
      relatedEntityType: "system",
    });
  },
  
  ONBOARDING_COMPLETED: async (userId: number) => {
    return createNotification({
      userId,
      title: "Onboarding Complete",
      message: "Your profile has been set up successfully. You're now ready to create your first will!",
      type: "success",
      relatedEntityType: "system",
    });
  },
  
  SECURITY_2FA_ENABLED: async (userId: number) => {
    return createNotification({
      userId,
      title: "Two-Factor Authentication Enabled",
      message: "Two-Factor Authentication is now active on your account.",
      type: "success",
      relatedEntityType: "security",
    });
  },
  
  SECURITY_2FA_DISABLED: async (userId: number) => {
    return createNotification({
      userId,
      title: "Two-Factor Authentication Disabled",
      message: "Two-Factor Authentication has been disabled on your account.",
      type: "warning",
      relatedEntityType: "security",
    });
  },
  
  BENEFICIARY_INVITED: async (userId: number, beneficiaryName: string) => {
    return createNotification({
      userId,
      title: "Beneficiary Invited",
      message: `An invitation has been sent to ${beneficiaryName}.`,
      type: "info",
      relatedEntityType: "beneficiary",
    });
  },
  
  SKYLER_SUGGESTION: async (userId: number, suggestion: string) => {
    return createNotification({
      userId,
      title: "Skyler Suggested a Fix",
      message: suggestion,
      type: "info",
      relatedEntityType: "skyler",
    });
  },
  
  CHECK_IN_REMINDER: async (userId: number) => {
    return createNotification({
      userId,
      title: "Check-In Reminder",
      message: "Your weekly check-in is due. Please confirm your status.",
      type: "warning",
      relatedEntityType: "check-in",
    });
  },
  
  VIDEO_TESTIMONY_RECORDED: async (userId: number, willId: number) => {
    return createNotification({
      userId,
      title: "Video Recorded",
      message: "Your video testimony has been recorded and attached to your will.",
      type: "success",
      relatedEntityType: "video",
      relatedEntityId: willId,
    });
  },

  // Payment-related events
  PAYMENT_FAILED: async (userId: number, planType?: string) => {
    return createNotification({
      userId,
      title: "Payment Failed",
      message: `Your recent payment${planType ? ` for ${planType} plan` : ''} failed. Please update your payment method.`,
      type: "warning",
      relatedEntityType: "payment",
    });
  },
  
  PAYMENT_RECEIVED: async (userId: number, planType?: string) => {
    return createNotification({
      userId,
      title: "Payment Successful",
      message: `Your payment${planType ? ` for ${planType} plan` : ''} has been successfully processed.`,
      type: "success",
      relatedEntityType: "payment",
    });
  },
  
  // Support-related events
  SUPPORT_REQUEST_SENT: async (userId: number) => {
    return createNotification({
      userId,
      title: "Support Request Received",
      message: "We've received your message. Our team will respond shortly.",
      type: "info",
      relatedEntityType: "support",
    });
  },
  
  // Onboarding events
  DRAFT_SAVED: async (userId: number, willId: number, willTitle: string) => {
    return createNotification({
      userId,
      title: "Draft Saved",
      message: `Your progress on "${willTitle}" has been saved successfully.`,
      type: "info",
      relatedEntityType: "will",
      relatedEntityId: willId,
    });
  },
  
  // Will finalized/published notification
  WILL_PUBLISHED: async (userId: number, willId: number, willTitle: string) => {
    return createNotification({
      userId,
      title: "Will Published",
      message: `Your will "${willTitle}" has been published and is now officially finalized.`,
      type: "success",
      relatedEntityType: "will",
      relatedEntityId: willId,
    });
  },

  // Payment method update notification
  PAYMENT_METHOD_UPDATED: async (userId: number) => {
    return createNotification({
      userId,
      title: "Payment Method Updated",
      message: "Your payment method has been successfully updated.",
      type: "success",
      relatedEntityType: "payment",
    });
  },

  // Security-related notifications
  PASSWORD_CHANGED: async (userId: number) => {
    return createNotification({
      userId,
      title: "Password Changed",
      message: "Your account password was successfully changed.",
      type: "success",
      relatedEntityType: "security",
    });
  },

  ACCOUNT_LOGIN: async (userId: number, deviceInfo?: string) => {
    return createNotification({
      userId,
      title: "New Login Detected",
      message: deviceInfo 
        ? `Your account was accessed from a new device: ${deviceInfo}.` 
        : "Your account was accessed from a new device.",
      type: "info",
      relatedEntityType: "security",
    });
  },

  // Custom notification
  CUSTOM: async (userId: number, title: string, message: string, type: "info" | "warning" | "success" = "info") => {
    return createNotification({
      userId,
      title,
      message,
      type,
      relatedEntityType: "system",
    });
  }
};