import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { users } from '@shared/schema';

/**
 * Generate a new TOTP secret for the user
 */
export function generateSecret(username: string): {
  secret: speakeasy.GeneratedSecret,
  qrCodeUrl: Promise<string>
} {
  // Generate a secret
  const secret = speakeasy.generateSecret({
    name: `WillTank | ${username}`,
  });

  // Generate QR code data URL
  // Type assertion to handle potentially undefined otpauth_url
  const otpauthUrl = secret.otpauth_url as string;
  const qrCodeUrl = QRCode.toDataURL(otpauthUrl);

  return { secret, qrCodeUrl };
}

/**
 * Verify a TOTP token against a secret
 */
export function verifyToken(token: string, secret: string): boolean {
  try {
    // Normalize token by removing spaces and non-numeric characters
    const normalizedToken = token.replace(/\D/g, '');
    
    // Verify with speakeasy
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: normalizedToken,
      window: 2 // Allow 2 time steps before/after for clock drift (more forgiving)
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
}

/**
 * Generate random backup codes
 */
export function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate a random 8-character code using alphanumeric characters
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    // Format as XXXX-XXXX for readability
    codes.push(`${code.substring(0, 4)}-${code.substring(4, 8)}`);
  }
  return codes;
}

/**
 * Verify a backup code
 */
export function verifyBackupCode(
  enteredCode: string,
  storedCodes: string[]
): { valid: boolean; remainingCodes: string[] } {
  const normalizedCode = enteredCode.toUpperCase().replace(/\s/g, '');
  
  const codeIndex = storedCodes.findIndex(code => 
    code.replace('-', '') === normalizedCode || code === normalizedCode
  );
  
  if (codeIndex === -1) {
    return { valid: false, remainingCodes: storedCodes };
  }
  
  // Remove the used code
  const remainingCodes = [
    ...storedCodes.slice(0, codeIndex),
    ...storedCodes.slice(codeIndex + 1)
  ];
  
  return { valid: true, remainingCodes };
}

/**
 * Enable 2FA for a user
 */
export async function enable2FA(userId: number, secret: string): Promise<void> {
  // Generate backup codes
  const backupCodes = generateBackupCodes();
  
  // Properly format and sanitize backup codes for JSON storage
  const backupCodesJson = JSON.stringify(backupCodes);
  
  try {
    // Update user record
    await db.update(users)
      .set({
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        backupCodes: backupCodesJson,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    // Send security notification in production mode
    if (process.env.NODE_ENV === 'production') {
      try {
        // Get user details for notification
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, userId));
        
        if (user && user.email) {
          // Import the email service here to avoid circular dependencies
          const { sendEmail } = await import('./email');
          
          // Production security notification
          // Fix email sending to match signature
          const htmlContent = `
            <h2>WillTank Security Notification</h2>
            <p>Two-factor authentication has been successfully enabled for your WillTank account.</p>
            <p>If you did not make this change, please contact support immediately at <a href="mailto:support@willtank.com">support@willtank.com</a>.</p>
            <p>For security purposes, please keep your backup codes in a safe place.</p>
            <p>Thank you for enhancing the security of your WillTank account.</p>
          `;
          
          await sendEmail(
            user.email, 
            "Security Alert: Two-Factor Authentication Enabled",
            htmlContent
          );
          
          console.log(`[PRODUCTION] 2FA security notification sent to user ${userId} (${user.email})`);
        }
      } catch (notificationError) {
        // Log but don't fail the entire operation if notification fails
        console.error("Error sending 2FA security notification:", notificationError);
      }
    }
  } catch (error) {
    console.error("Error enabling 2FA:", error);
    throw new Error("Failed to enable 2FA for your account. Please try again.");
  }
}

/**
 * Disable 2FA for a user
 */
export async function disable2FA(userId: number): Promise<void> {
  await db.update(users)
    .set({
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: null
    })
    .where(eq(users.id, userId));
}

/**
 * Get a user's 2FA status
 */
export async function get2FAStatus(userId: number): Promise<{
  enabled: boolean;
  secret?: string;
  backupCodes?: string[];
}> {
  const [user] = await db
    .select({
      twoFactorEnabled: users.twoFactorEnabled,
      twoFactorSecret: users.twoFactorSecret,
      backupCodes: users.backupCodes
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    throw new Error('User not found');
  }

  // Safely parse the backup codes, handling potential format issues
  let parsedBackupCodes;
  if (user.backupCodes) {
    try {
      // First check if the backupCodes is already a string or object
      const backupCodesValue = user.backupCodes;
      
      if (typeof backupCodesValue === 'string') {
        // Check if the string appears to be JSON
        if (backupCodesValue.trim().startsWith('[') && backupCodesValue.trim().endsWith(']')) {
          // Attempt to parse as JSON
          parsedBackupCodes = JSON.parse(backupCodesValue);
        } else {
          // Handle comma-separated format
          parsedBackupCodes = backupCodesValue.split(',').map(code => code.trim());
        }
      } else if (Array.isArray(backupCodesValue)) {
        // It's already an array, use as is
        parsedBackupCodes = backupCodesValue;
      } else {
        // It's some other type of value, convert to string
        parsedBackupCodes = String(backupCodesValue).split(',').map(code => code.trim());
      }
    } catch (e) {
      console.error('Error parsing backup codes:', e);
      parsedBackupCodes = undefined;
    }
  }

  // Make sure we're correctly determining if 2FA is enabled
  // Only return true if the flag is explicitly true
  const enabled = user.twoFactorEnabled === true;
  
  return {
    enabled,
    secret: user.twoFactorSecret || undefined,
    backupCodes: parsedBackupCodes
  };
}