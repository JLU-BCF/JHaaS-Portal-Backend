import { Request, Response } from 'express';
import { genericError } from '../helpers/ErrorHelper';
import User from '../models/User';

export const authGuard = (req: Request, res: Response, next: (error?: unknown) => void) => {
  if (req.user instanceof User) return next();
  return genericError.unauthorized(res);
};
