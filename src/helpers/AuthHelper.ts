import { Request } from 'express';
import User from '../models/User';

export function isUserAdminOrSelf(req: Request, userId: string) {
  return getUser(req).isAdmin || checkUserId(req, userId);
}

export function getUser(req: Request): User {
  return req.user as User;
}

export function getUserId(req: Request): string {
  return getUser(req).id;
}

export function checkUserId(req: Request, userId: string): boolean {
  return getUserId(req) == userId;
}
