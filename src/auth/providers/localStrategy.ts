import { Router } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { compareSync } from 'bcrypt';
import jwt from 'jsonwebtoken';

import bodyParserHelper from '../../helpers/BodyParserHelper';
import CredentialsRepository from '../../repositories/CredentialsRepository';
import Credentials, { AuthProvider } from '../../models/Credentials';
import UserRepository from '../../repositories/UserRepository';
import User from '../../models/User';
import { JWT_SECRET } from '../../config/Config';

/* Configure password authentication strategy.
 *
 * The `LocalStrategy` authenticates users by verifying a username and password.
 * The strategy parses the username and password from the request and calls the
 * `verify` function.
 *
 * The `verify` function queries the database for the user record and verifies
 * the password by hashing the password supplied by the user and comparing it to
 * the hashed password stored in the database.  If the comparison succeeds, the
 * user is authenticated; otherwise, not.
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email'
    },
    (email: string, password: string, cb) => {
      CredentialsRepository.findByProvider(AuthProvider.LOCAL, email)
        .then((credentialsInstance) => {
          if (!credentialsInstance) {
            return cb(null, false, { message: 'Incorrect email or password.' });
          }

          if (compareSync(password, credentialsInstance.password)) {
            return cb(null, credentialsInstance.user, { message: 'Logged In Successfully' });
          }

          return cb(null, false, { message: 'Incorrect email or password.' });
        })
        .catch((err) => {
          console.log(err);
          return cb(err);
        });
    }
  )
);

const localStrategy = Router();

/* POST /login/password
 *
 * This route authenticates the user by verifying a username and password.
 *
 * A username and password are submitted to this route via an HTML form, which
 * was rendered by the `GET /login` route.  The username and password is
 * authenticated using the `local` strategy.  The strategy will parse the
 * username and password from the request and call the `verify` function.
 *
 * Upon successful authentication, a login session will be established.  As the
 * user interacts with the app, by clicking links and submitting forms, the
 * subsequent requests will be authenticated by verifying the session.
 *
 * When authentication fails, the user will be re-prompted to login and shown
 * a message informing them of what went wrong.
 */
localStrategy.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user: User) => {
    if (err || !user) {
      return res.json({ msg: 'nope', err, user });
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        return res.json({ msg: 'nope', err });
      }
      const token = jwt.sign({ user: user }, JWT_SECRET);
      return res.json({ jwt: token });
    });
  })(req, res);
});

/* POST /signup
 *
 * This route creates a new user account.
 *
 * A desired username and password are submitted to this route via an HTML form,
 * which was rendered by the `GET /signup` route.  The password is hashed and
 * then a new user record is inserted into the database.  If the record is
 * successfully created, the user is logged in.
 */
localStrategy.post('/signup', (req, res, next) => {
  const user = bodyParserHelper.parseUser(req);
  const { password } = req.body;

  const credentials = new Credentials(user, AuthProvider.LOCAL, user.email, password);

  UserRepository.createOne(user)
    .then((userInstance) => {
      CredentialsRepository.createOne(credentials)
        .then(() => {
          return res.json(userInstance);
        })
        .catch((err) => {
          console.log(err);
          UserRepository.deleteById(userInstance.id);
          return res.status(500).json(err);
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json(err);
    });
});

export default localStrategy;
