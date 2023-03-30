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
  // get and check refresh token
  const refreshToken = req.headers['token'] as string;
  const refreshTokenSecret = getValidSignatureKey(refreshToken);
  if (!refreshTokenSecret) {
    return res.status(401).json('Invalid refresh token signature.');
  }

  // get and check token
  const bearerHeader = req.headers['authorization'] as string;
  const token = bearerHeader.split(' ')[1];
  const tokenSecret = getValidSignatureKey(token);
  if (!tokenSecret) {
    return res.status(401).json('Invalid token signature.');
  }

  // verify token with refreshtoken
  try {
    const tokenPayload = jwt.verify(token, tokenSecret, { ignoreExpiration: true });
    const refreshTokenPayload = jwt.verify(refreshToken, refreshTokenSecret);

    if (refreshTokenPayload['id'] == tokenPayload['user']['id']) {
      const user: User = tokenPayload['user'] as User;
      respondTokens(user, res);
    }
  } catch {
    return res.status(401).json('Invalid token.');
  }
});

/* POST /logout
 *
 * This route logs the user out.
 */
authService.post('/logout', function (req, res, next) {
  req.logout(() => {
    res.redirect('/');
  });
});

export default authService;
