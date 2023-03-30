import { Request, Response } from 'express';
import User from '../models/User';
import { validationResult } from 'express-validator';

export function parseUser(req: Request): User {
  const { firstName, lastName, email } = req.body;

  const user: User = new User();
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;

  return user;
}

export function validationErrors(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json(errors.array());
    return true;
  }
  return false;
}
