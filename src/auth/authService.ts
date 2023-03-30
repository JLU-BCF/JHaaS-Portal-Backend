import passport from 'passport';
import express, { Router } from 'express';
import LocalStrategy from './providers/localStrategy';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User';
import { JWT_SECRET } from '../config/Config';

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET
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
