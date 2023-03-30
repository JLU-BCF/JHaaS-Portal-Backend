import { Router } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { compareSync } from 'bcrypt';

import { parseUser, validationErrors } from '../../helpers/BodyParserHelper';
import CredentialsRepository from '../../repositories/CredentialsRepository';
import Credentials, { AuthProvider } from '../../models/Credentials';
import UserRepository from '../../repositories/UserRepository';
import User from '../../models/User';
import { respondTokens } from '../../helpers/AuthHelper';
import {
  localLoginValidation,
  localSignupValidation,
  localUpdateEmailValidation,
  localUpdatePasswordValidation
} from '../authValidationRules';

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
            return cb('Incorrect email or password.', false);
          }

          if (compareSync(password, credentialsInstance.password)) {
            return cb(null, credentialsInstance.user, { message: 'Logged In Successfully' });
          }

          return cb('Incorrect email or password.', false);
        })
        .catch((err) => {
          console.log(err);
          return cb('Oops - Something went wrong.', false);
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
localStrategy.post('/login', localLoginValidation, (req, res, next) => {
  if (validationErrors(req, res)) return;

  passport.authenticate('local', { session: false }, (err, user: User) => {
    if (err || !user) {
      return res.json(err);
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        console.log(err);
        return res.json('Oops - Something went wrong.');
      }
      respondTokens(user, res);
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
localStrategy.post('/signup', localSignupValidation, async (req, res, next) => {
  if (validationErrors(req, res)) return;

  const user = parseUser(req);
  const { password } = req.body;

  const credentials = new Credentials(user, AuthProvider.LOCAL, user.email, password);

  try {
    if (await CredentialsRepository.findByProvider(AuthProvider.LOCAL, user.email)) {
      return res.status(422).json('Email address is already taken.');
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json('Oops - Something went wrong.');
  }

  CredentialsRepository.createOne(credentials)
    .then((credentialsInstance) => {
      UserRepository.createOne(user)
        .then((userInstance) => {
          return res.json(userInstance);
        })
        .catch((err) => {
          CredentialsRepository.deleteByUserId(credentialsInstance.userId);
          console.log(err);
          return res.status(500).json('Oops - Something went wrong.');
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json('Oops - Something went wrong.');
    });
});

localStrategy.patch('/password', localUpdatePasswordValidation, (req, res, next) => {
  if (validationErrors(req, res)) return;
  // get credentials from db
  // check password
  // set new password
});

localStrategy.patch('/email', localUpdateEmailValidation, (req, res, next) => {
  if (validationErrors(req, res)) return;
  // get credentials from db
  // check if requested email is not taken
  // check if password matches
  // set new email
});

export default localStrategy;
