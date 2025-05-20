import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { AppError } from './errorHandler';

export const validateRequest = (schema: Schema) => (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    throw new AppError(errorMessages.join(', '), 400);
  }
  next();
}; 