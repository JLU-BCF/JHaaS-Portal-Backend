import { Request } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import {
  JWT_SECRET_A,
  JWT_SECRET_B,
  JWT_ACTIVE_SECRET,
  JWT_EXPIRY,
  JWT_REFRESH_EXPIRY
} from '../config/Config';
import { Response } from 'express';

export function getUserId(req: Request): string {
  const user = req.user as User;
  return user.id;
}

export function checkUserId(req: Request, userId: string): boolean {
  return getUserId(req) == userId;
}

export function getLatestSignatureKey() {
  return JWT_ACTIVE_SECRET == 'A' ? JWT_SECRET_A : JWT_SECRET_B;
}

export function secretOrKeyProvider(req, rawJwtToken, done) {
  const secret = getValidSignatureKey(rawJwtToken);

  if (secret) {
    done(null, secret);
  } else {
    done('JWT invalid');
  }
}

export function getValidSignatureKey(rawJwtToken: string) {
  for (const secret of [JWT_SECRET_A, JWT_SECRET_B]) {
    if (checkJwtSignatureValid(rawJwtToken, secret)) {
      return secret;
    }
  }
  return false;
}

export function checkJwtSignatureValid(rawJwtToken: string, secret: string) {
  try {
    jwt.verify(rawJwtToken, secret, {
      ignoreExpiration: true
    });
  } catch {
    return false;
  }
  return true;
}

export function respondTokens(user: User, res: Response) {
  const token = jwt.sign({ user: user }, getLatestSignatureKey(), {
    expiresIn: JWT_EXPIRY
  });
  const refreshToken = jwt.sign({ id: user.id }, getLatestSignatureKey(), {
    expiresIn: JWT_REFRESH_EXPIRY
  });
  return res.cookie('token', refreshToken, { httpOnly: true }).json({ jwt: token });
}
