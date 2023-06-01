import { Request, Response } from 'express';
import { genericError } from '../helpers/ErrorHelper';
import { getUser } from '../helpers/AuthHelper';

export const leaderGuard = (req: Request, res: Response, next: (error?: unknown) => void) => {
  if (getUser(req).isLead) return next();
  return genericError.forbidden(res);
};
