import nodemailer from 'nodemailer';

// SMTP Configuration interfaces
interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  tls?: {
    rejectUnauthorized: boolean;
  };
  debug?: boolean;
  logger?: boolean;
  connectionTimeout?: number;
  greetingTimeout?: number;
  socketTimeout?: number;
}

// Provider-specific configurations

// Namecheap Private Email SMTP Configuration
export function getNamecheapSmtpConfig(): SmtpConfig {
  return {
    host: process.env.SMTP_HOST || 'mail.privateemail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    tls: {
      rejectUnauthorized: false, // For development only
    },
    debug: true,
    logger: true,
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
  };
}

// Gmail SMTP Configuration
export function getGmailSmtpConfig(): SmtpConfig {
  return {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER || '',
      pass: process.env.GMAIL_APP_PASSWORD || '', // App password, not regular password
    },
    tls: {
      rejectUnauthorized: true,
    },
  };
}

// Office 365 SMTP Configuration
export function getOffice365SmtpConfig(): SmtpConfig {
  return {
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.OFFICE365_USER || '',
      pass: process.env.OFFICE365_PASSWORD || '',
    },
  };
}

// Create a transporter based on configured service
export function createEmailTransporter() {
  // Which service to use? Default to Namecheap
  const service = process.env.EMAIL_SERVICE || 'namecheap';
  
  let config: SmtpConfig;
  
  // Select configuration based on service name
  switch(service.toLowerCase()) {
    case 'gmail':
      config = getGmailSmtpConfig();
      break;
    case 'office365':
      config = getOffice365SmtpConfig();
      break;
    case 'namecheap':
    default:
      config = getNamecheapSmtpConfig();
      break;
  }
  
  // Log the configuration (excluding password)
  console.log(`Using ${service} SMTP configuration:`, {
    ...config,
    auth: { 
      user: config.auth.user,
      pass: '******' // Mask the password
    }
  });
  
  return nodemailer.createTransport(config);
}

// Create a test transporter for testing only
export function createTestEmailTransporter() {
  // This uses Ethereal, a fake SMTP service for testing
  // It captures emails but doesn't actually send them
  
  // In a production environment, you'd typically use your main email service
  // but for troubleshooting connection issues, Ethereal can be helpful
  
  // This function is asynchronous because it needs to create a test account
  return new Promise<nodemailer.Transporter>((resolve, reject) => {
    nodemailer.createTestAccount((err, account) => {
      if (err) {
        console.error('Failed to create a testing account:', err);
        reject(err);
        return;
      }
      
      console.log('Created Ethereal test account:', account.user);
      
      // Create a transporter using the test account
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });
      
      resolve(transporter);
    });
  });
}