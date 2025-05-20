import nodemailer from 'nodemailer';
import { logger } from './logger';
import { config } from '../config';

interface EmailOptions {
  email: string;
  subject: string;
  template: string;
  data: {
    name: string;
    verificationUrl?: string;
    resetUrl?: string;
    [key: string]: any;
  };
}

// Create email templates
const emailTemplates = {
  emailVerification: (data: EmailOptions['data']) => ({
    subject: 'Verify Your Email',
    html: `
      <h1>Welcome to Eyewear E-commerce!</h1>
      <p>Hi ${data.name},</p>
      <p>Thank you for registering. Please click the link below to verify your email address:</p>
      <a href="${data.verificationUrl}" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #4CAF50;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        margin: 16px 0;
      ">Verify Email</a>
      <p>If you did not create an account, please ignore this email.</p>
      <p>This link will expire in 24 hours.</p>
    `,
  }),

  passwordReset: (data: EmailOptions['data']) => ({
    subject: 'Reset Your Password',
    html: `
      <h1>Password Reset Request</h1>
      <p>Hi ${data.name},</p>
      <p>We received a request to reset your password. Click the link below to reset it:</p>
      <a href="${data.resetUrl}" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #4CAF50;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        margin: 16px 0;
      ">Reset Password</a>
      <p>If you did not request a password reset, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `,
  }),

  passwordChanged: (data: EmailOptions['data']) => ({
    subject: 'Password Changed Successfully',
    html: `
      <h1>Password Changed</h1>
      <p>Hi ${data.name},</p>
      <p>Your password has been successfully changed.</p>
      <p>If you did not make this change, please contact our support team immediately.</p>
      <p>Best regards,<br>EyeWear Team</p>
    `,
  }),

  emailUpdated: (data: EmailOptions['data']) => ({
    subject: 'Email Address Updated',
    html: `
      <h1>Email Address Updated</h1>
      <p>Hi ${data.name},</p>
      <p>Your email address has been successfully updated.</p>
      <p>If you did not make this change, please contact our support team immediately.</p>
      <p>Best regards,<br>EyeWear Team</p>
    `,
  }),
};

// Create transporter
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

// Send email
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const template = emailTemplates[options.template as keyof typeof emailTemplates];
    if (!template) {
      throw new Error(`Email template '${options.template}' not found`);
    }

    const { subject, html } = template(options.data);

    const mailOptions = {
      from: config.email.from,
      to: options.email,
      subject: options.subject || subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.email}`);
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
}; 