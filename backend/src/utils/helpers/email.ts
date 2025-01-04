import nodemailer, { TransportOptions } from 'nodemailer';
import mailgunTransport from 'nodemailer-mailgun-transport';
import { logger } from '@/utils/logger';
import * as handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';
import '@/utils/types/env';

// Create appropriate transporter based on environment
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
      throw new Error('Mailgun configuration is missing');
    }
    
    // Mailgun configuration for production
    const auth = {
      auth: {
        api_key: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
      }
    };
    return nodemailer.createTransport(mailgunTransport(auth));
  } else {
    // Mailhog configuration for development
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025'),
      auth: null,
      secure: false,
      ignoreTLS: true,
    } as TransportOptions);
  }
};

const emailTransporter = createTransporter();

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

const getTemplate = async (templateName: string): Promise<handlebars.TemplateDelegate> => {
  const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.hbs`);
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  return handlebars.compile(templateContent);
};

const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const template = await getTemplate(options.template);
    const html = template(options.context);

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
      to: options.to,
      subject: options.subject,
      html,
    };

    await emailTransporter.sendMail(mailOptions);
    logger.info('Email sent successfully', {
      to: options.to,
      template: options.template,
      environment: process.env.NODE_ENV,
    });
    return true;
  } catch (error) {
    logger.error('Error sending email', error);
    return false;
  }
};

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  await sendEmail({
    to: email,
    subject: 'Verify Your Email Address',
    template: 'verify-email',
    context: {
      email,
      verificationUrl,
      firstName: email.split('@')[0], // Fallback if name not provided
    },
  });
};

export const sendWelcomeEmail = async (email: string, firstName: string, token: string): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  await sendEmail({
    to: email,
    subject: 'Welcome to Invoice App',
    template: 'welcome',
    context: {
      email,
      firstName,
      verificationUrl,
    },
  });
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  await sendEmail({
    to: email,
    subject: 'Reset Your Password',
    template: 'reset-password',
    context: {
      email,
      resetUrl,
      firstName: email.split('@')[0], // Fallback if name not provided
    },
  });
};

export const send2FACode = async (email: string, code: string): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Your Two-Factor Authentication Code',
    template: 'two-factor',
    context: {
      email,
      code,
      firstName: email.split('@')[0], // Fallback if name not provided
    },
  });
};

// Verify transporter connection
emailTransporter.verify((error: Error | null) => {
  if (error) {
    logger.error('Error connecting to email service', error);
  } else {
    logger.info('Email service is ready to send messages', {
      environment: process.env.NODE_ENV,
      transport: process.env.NODE_ENV === 'production' ? 'Mailgun' : 'Mailhog'
    });
  }
}); 