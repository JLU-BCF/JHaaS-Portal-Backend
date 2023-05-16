import passport from 'passport';
import express, { Router } from 'express';
import LocalStrategy from './providers/localStrategy';
import OidcStrategy from './providers/oidcStrategy';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import UserRepository from '../repositories/UserRepository';
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
      const jwtUser: User = payload.user;

      // jwtUser could be outdated!
      UserRepository.findById(jwtUser.id)
        .then((userInstance: User) => {
          if (userInstance) {
            cb(null, userInstance);
          } else {
            cb(null, false);
          }
        })
        .catch((err) => {
          console.log(err);
          cb('Authentication Error.', false);
        });
    }
  )
);

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { user: user });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

const authService = Router();
authService.use(express.json());
authService.use('/local', LocalStrategy);
authService.use('/oidc', OidcStrategy);

/* POST /refresh
 *
 * Refresh JWT
 */
authService.post('/refresh', function (req, res, next) {
  // prepare auth header and cookie parsing for refresh token check
  const authHeader = req.headers['authorization'];
  const cookies = req.headers.cookie?.split(';')?.reduce((obj, c) => {
    const n = c.split('=');
    obj[n[0].trim()] = n[1].trim();
    return obj;
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
      // Get actual user from Database
      return UserRepository.findById(refreshTokenPayload['id'])
        .then((userInstance: User) => {
          if (userInstance) {
            return respondTokens(userInstance, res);
          }
          return res.status(422).json('Unknown User.');
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json('Authentication Error.');
        });
    } else {
      return res.status(401).json('Invalid token.');
    }
  } catch {
    return res.status(401).json('Invalid token.');
  }
});

export default authService;
