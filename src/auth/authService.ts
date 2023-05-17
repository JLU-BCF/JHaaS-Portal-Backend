import passport from 'passport';
import { Router } from 'express';
import LocalStrategy from './providers/localStrategy';
import OidcStrategy from './providers/oidcStrategy';
import UserRepository from '../repositories/UserRepository';
import User from '../models/User';
import { genericError } from '../helpers/ErrorHelper';

passport.serializeUser(function (user: User, cb) {
  process.nextTick(function () {
    cb(null, user);
  });
});

passport.deserializeUser(function (user: User, cb) {
  process.nextTick(function () {
    UserRepository.findById(user.id)
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
  });
});

const authService = Router();
authService.use('/local', LocalStrategy);
authService.use('/oidc', OidcStrategy);

authService.delete('/session', (req, res) => {
  if (req.user instanceof User) {
    return req.logout((err) => {
      if (err) {
        return genericError.internalServerError(res);
      }
      return res.json('Logged out successfully');
    });
  }
  return genericError.unprocessableEntity(res);
});

export default authService;
