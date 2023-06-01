import passport from 'passport';
import { Router } from 'express';
import LocalStrategy from './providers/localStrategy';
import OidcStrategy from './providers/oidcStrategy';
import UserRepository from '../repositories/UserRepository';
import User from '../models/User';
import { genericError } from '../helpers/ErrorHelper';
import { ENABLE_LOCAL_ACCOUNTS, FRONTEND_LOGOUT_URL } from '../config/Config';

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
          userInstance.sessionLogout = user.sessionLogout;
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

if (ENABLE_LOCAL_ACCOUNTS) {
  authService.use('/local', LocalStrategy);
}

authService.use('/oidc', OidcStrategy);

authService.post('/logout', (req, res) => {
  if (req.user instanceof User) {
    const logoutUrl = req.user.sessionLogout;
    return req.logout((err) => {
      if (err) {
        console.log(err);
        return genericError.internalServerError(res);
      }
      if (logoutUrl) {
        return res.redirect(logoutUrl);
      }
      return res.redirect(FRONTEND_LOGOUT_URL);
    });
  }

  // somethings not quite right - destroy the session
  return req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return genericError.internalServerError(res);
    }
    return res.redirect(FRONTEND_LOGOUT_URL);
  });
});

export default authService;
