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
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1 // Allow 1 time step before/after for clock drift
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
  
  // Update user record
  await db.update(users)
    .set({
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      backupCodes: backupCodesJson
    })
    .where(eq(users.id, userId));
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

  // Safely parse the backup codes JSON, handling potential format issues
  let parsedBackupCodes;
  if (user.backupCodes) {
    try {
      parsedBackupCodes = JSON.parse(user.backupCodes as string);
    } catch (e) {
      console.error('Error parsing backup codes:', e);
      parsedBackupCodes = undefined;
    }
  }

  return {
    enabled: user.twoFactorEnabled || false,
    secret: user.twoFactorSecret || undefined,
    backupCodes: parsedBackupCodes
  };
}