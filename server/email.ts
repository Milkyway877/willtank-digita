import nodemailer from 'nodemailer';
import { createEmailTransporter, createTestEmailTransporter } from './email-services';

// Helper to strip HTML for plain text alternative
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Function to get email transporter - use the configured service from email-services.ts
const getTransporter = async () => {
  try {
    // In production mode, we use the configured email service
    if (process.env.EMAIL_TEST_MODE !== 'true') {
      console.log(`Using production email service: ${process.env.EMAIL_SERVICE}`);
      const transporter = await createEmailTransporter();
      return transporter;
    }
    
    // In test mode, use Ethereal
    console.log('Using test email transporter (Ethereal)');
    return await createTestEmailTransporter();
  } catch (error) {
    console.error('Error creating email transporter:', error);
    throw error;
  }
};

// Enhanced function to send emails via SMTP with improved error handling and response
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; message: string; details?: string; previewUrl?: string }> {
  try {
    // Get the from address
    const from = process.env.SMTP_FROM || '"WillTank Support" <SUPPORT@WILLTANK.COM>';
    
    // Create transporter and send email
    const transporter = await getTransporter();
    
    // Enhanced email options with proper headers and text alternative
    const mailOptions = {
      from,
      to,
      subject,
      text: stripHtml(html), // Plain text alternative
      html,
      headers: {
        'X-Priority': '1', // High priority
        'X-Mailer': 'WillTank Mailer',
        'Message-ID': `<${Date.now()}.${Math.random().toString(36).substring(2)}@willtank.com>`
      }
    };

    // Send mail with more detailed logging
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully delivered: ${info.messageId}`);
    
    // Handle preview URL for Ethereal test emails
    let previewUrl = undefined;
    let details = undefined;
    
    // If it's a test/Ethereal email, capture the URL where the email can be viewed
    if (process.env.EMAIL_TEST_MODE === 'true') {
      if (info.messageId && typeof (info as any).getTestMessageUrl === 'function') {
        previewUrl = (info as any).getTestMessageUrl();
        console.log(`Preview URL: ${previewUrl}`);
        details = 'Test email captured (preview available)';
      }
    } else {
      details = `Message delivered with ID: ${info.messageId}`;
    }
    
    return { 
      success: true, 
      message: 'Email sent successfully',
      details,
      previewUrl
    };
  } catch (error: any) {
    console.error('Error sending email:', error);
    
    // Detailed error categorization
    let details = error.message;
    
    // Enhanced error detection
    if (error.code === 'EAUTH') {
      details = 'Authentication failed. Check your SMTP username and password.';
    } 
    else if (error.code === 'ESOCKET' || error.code === 'ECONNECTION') {
      details = 'Connection error. Check your SMTP host, port, and firewall settings.';
    }
    else if (error.code === 'ETIMEDOUT') {
      details = 'Connection timed out. The mail server may be unavailable or blocked.';
    }
    else if (error.code === 'EENVELOPE') {
      details = 'Invalid envelope (from/to addresses). Check email format.';
    }
    else if (error.responseCode >= 500) {
      details = `Server error (${error.responseCode}): ${error.response}`;
    }
    
    // Log detailed error info for server-side troubleshooting
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      
      // If it's a NodeMailer error, log additional details
      if ('code' in error) {
        console.error('Error code:', error.code);
      }
      if ('response' in error) {
        console.error('SMTP Response:', error.response);
      }
      if ('responseCode' in error) {
        console.error('SMTP Response code:', error.responseCode);
      }
      if ('command' in error) {
        console.error('SMTP Command:', error.command);
      }
    }
    
    return { 
      success: false, 
      message: 'Failed to send email', 
      details
    };
  }
}

// Email template for verification OTP
export function createVerificationEmailTemplate(code: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #333;">Verify Your WillTank Account</h2>
      </div>
      <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
        <p style="margin-bottom: 15px;">Thank you for registering with WillTank. Please use the following verification code to complete your registration:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 15px 30px; background-color: #f0f0f0; border-radius: 5px; letter-spacing: 5px; font-size: 24px; font-weight: bold;">
            ${code}
          </div>
        </div>
        <p style="margin-bottom: 15px;">This code will expire in 10 minutes.</p>
        <p>If you didn't request this verification code, please ignore this email.</p>
      </div>
      <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>© 2024 WillTank. All rights reserved.</p>
      </div>
    </div>
  `;
}

// Email template for password reset
export function createPasswordResetEmailTemplate(token: string): string {
  const resetUrl = `${process.env.CLIENT_URL || ''}/auth/reset-password?token=${token}`;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #333;">Reset Your WillTank Password</h2>
      </div>
      <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
        <p style="margin-bottom: 15px;">You've requested to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4a90e2; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="margin-bottom: 15px;">This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you're concerned.</p>
      </div>
      <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>© 2024 WillTank. All rights reserved.</p>
      </div>
    </div>
  `;
}

// Email template for beneficiary/executor invitation
export function createInvitationEmailTemplate(
  inviterName: string, 
  role: 'beneficiary' | 'executor',
  otp: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #333;">WillTank Invitation</h2>
      </div>
      <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
        <p style="margin-bottom: 15px;">Hello,</p>
        <p style="margin-bottom: 15px;">${inviterName} has named you as a ${role === 'beneficiary' ? 'beneficiary' : 'executor'} in their will on WillTank.</p>
        <p style="margin-bottom: 15px;"><strong>What this means:</strong></p>
        <p style="margin-bottom: 15px;">${
          role === 'beneficiary' 
            ? 'As a beneficiary, you may be entitled to certain assets or property as specified in the will.' 
            : 'As an executor, you would be responsible for carrying out the instructions in the will when the time comes.'
        }</p>
        <p style="margin-bottom: 15px;">Please use the following verification code to confirm your role:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 15px 30px; background-color: #f0f0f0; border-radius: 5px; letter-spacing: 5px; font-size: 24px; font-weight: bold;">
            ${otp}
          </div>
        </div>
        <p style="margin-bottom: 15px;">This code will expire in 10 minutes.</p>
      </div>
      <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>© 2024 WillTank. All rights reserved.</p>
      </div>
    </div>
  `;
}

// Email template for weekly check-in
export function createWeeklyCheckInEmailTemplate(userName: string, confirmAliveUrl: string, reportDeathUrl: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #333;">WillTank Weekly Check-in</h2>
      </div>
      <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
        <p style="margin-bottom: 15px;">Hello,</p>
        <p style="margin-bottom: 15px;">This is a weekly check-in regarding ${userName}'s will on WillTank.</p>
        <p style="margin-bottom: 15px;">Please confirm the current status:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmAliveUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin-right: 10px;">Confirm Alive</a>
          <a href="${reportDeathUrl}" style="display: inline-block; padding: 12px 24px; background-color: #F44336; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Report Death</a>
        </div>
        <p style="margin-bottom: 15px;">Your response is important to maintain the security and integrity of WillTank's services.</p>
      </div>
      <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>© 2024 WillTank. All rights reserved.</p>
      </div>
    </div>
  `;
}

// Email template for death verification (5-way unlock)
export function createDeathVerificationEmailTemplate(deceasedName: string, viewPortalUrl: string, otp: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #333;">Important: Will Access Verification</h2>
      </div>
      <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
        <p style="margin-bottom: 15px;">Hello,</p>
        <p style="margin-bottom: 15px;">We've received confirmation that ${deceasedName} has passed away. As a trusted contact, you're part of the verification process to access their will.</p>
        <p style="margin-bottom: 15px;">Please use the following verification code when prompted on the portal:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 15px 30px; background-color: #f0f0f0; border-radius: 5px; letter-spacing: 5px; font-size: 24px; font-weight: bold;">
            ${otp}
          </div>
        </div>
        <p style="margin-bottom: 15px;">Access the will portal here:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${viewPortalUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4a90e2; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Access Will Portal</a>
        </div>
        <p style="margin-bottom: 15px;">Important: This code is valid for 10 minutes only. The will can only be downloaded if all 5 trusted contacts enter their codes within this time window.</p>
      </div>
      <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>© 2024 WillTank. All rights reserved.</p>
      </div>
    </div>
  `;
}