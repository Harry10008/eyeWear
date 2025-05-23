import { IAdmin } from '../../models/admin.model';
import { Request as ExpressRequest } from 'express';

declare global {
  namespace Express {
    interface Request {
      admin?: IAdmin;
    }
  }
}

export type Request = ExpressRequest; 