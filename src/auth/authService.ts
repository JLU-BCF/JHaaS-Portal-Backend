import passport from 'passport';
import express, { Router } from 'express';
import LocalStrategy from './providers/localStrategy';

/* Configure session management.
 *
 * When a login session is established, information about the user will be
 * stored in the session.  This information is supplied by the `serializeUser`
 * function, which is yielding the user ID and username.
 *
 * As the user interacts with the app, subsequent requests will be authenticated
 * by verifying the session.  The same user information that was serialized at
 * session establishment will be restored when the session is authenticated by
 * the `deserializeUser` function.
 */
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

authService.get('/me', (req, res) => {
  res.json(req.user);
});

/* POST /logout
 *
 * This route logs the user out.
 */
authService.post('/logout', function(req, res, next) {
  req.logout(() => {
    res.redirect('/');
  });
});


export default authService;
