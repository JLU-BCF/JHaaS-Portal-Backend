import { Request, Response } from 'express';
import { genericError } from '../helpers/ErrorHelper';
import { getUser } from '../helpers/AuthHelper';

export const adminGuard = (req: Request, res: Response, next: (error?: unknown) => void) => {
  if (getUser(req).isAdmin) return next();
  return genericError.forbidden(res);
};
