import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  host: process.env.HOST || 'localhost',
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600', 10), // 1 hour
    refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800', 10) // 7 days
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/eyewear'
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
}; 