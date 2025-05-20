import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS'
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || '/api',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  mongodb: {
    uri: process.env.MONGODB_URI!,
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN || '7', 10),
  },

  email: {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT!, 10),
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
    from: process.env.SMTP_FROM || `Eyewear E-commerce <${process.env.SMTP_USER}>`,
  },

  upload: {
    path: process.env.UPLOAD_PATH || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    logFilePath: process.env.LOG_FILE_PATH || 'logs/combined.log',
    errorLogFilePath: process.env.ERROR_LOG_FILE_PATH || 'logs/error.log',
  },
} as const;

// Type for the config object
export type Config = typeof config; 