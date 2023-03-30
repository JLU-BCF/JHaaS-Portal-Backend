import passport from 'passport';
import express, { Router } from 'express';
import LocalStrategy from './providers/localStrategy';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User';
import { secretOrKeyProvider, getValidSignatureKey, respondTokens } from '../helpers/AuthHelper';
import jwt from 'jsonwebtoken';

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: secretOrKeyProvider
    },
    (payload, cb) => {
      const user: User = payload.user;
      return cb(null, user);
    }
  )
);

const authService = Router();
authService.use(express.json());
authService.use('/local', LocalStrategy);

/* POST /refresh
 *
 * Refresh JWT
 */
authService.post('/refresh', function (req, res, next) {
  // prepare auth header and cookie parsing for refresh token check
  const authHeader = req.headers['authorization'];
  const cookies = req.headers.cookie?.split(";")?.reduce((obj, c) => {
    var n = c.split("=");
    obj[n[0].trim()] = n[1].trim();
    return obj
  }, {});

  if (!authHeader || !cookies || !cookies['token']) {
    return res.status(400).json('Invalid request.');
  }

  // get and check refresh token
  const refreshToken = cookies['token'];
  const refreshTokenSecret = getValidSignatureKey(refreshToken);
  if (!refreshTokenSecret) {
    return res.status(401).json('Invalid refresh token.');
  }

  // get and check token
  const token = authHeader.split(' ')[1];
  const tokenSecret = getValidSignatureKey(token);
  if (!tokenSecret) {
    return res.status(401).json('Invalid access token.');
  }

  // verify token with refreshtoken
  try {
    const tokenPayload = jwt.verify(token, tokenSecret, { ignoreExpiration: true });
    const refreshTokenPayload = jwt.verify(refreshToken, refreshTokenSecret);

    if (refreshTokenPayload['id'] == tokenPayload['user']['id']) {
      return respondTokens(tokenPayload['user'] as User, res);
    } else {
      return res.status(401).json('Invalid token.');
    }
  } catch {
    return res.status(401).json('Invalid token.');
  }
});

export default authService;
