import mongoose from 'mongoose';
import { config } from './config';
import { logger } from '../utils/logger';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
}; 