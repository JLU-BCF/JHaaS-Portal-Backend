import { Request } from 'express';
import User from '../models/User';

export function parseUser(req: Request): User {
  const { firstName, lastName, email } = req.body;

  const user: User = new User();
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;

  return user;
}
