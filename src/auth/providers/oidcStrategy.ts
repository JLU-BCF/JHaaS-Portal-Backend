import { Router } from 'express';
import passport from 'passport';
import { Issuer, Strategy as OpenIDConnectStrategy, TokenSet } from 'openid-client';

import {
  OIDC_ENDPOINT,
  CALLBACK_URL,
  CLIENT_ID,
  CLIENT_SECRET,
  POST_LOGOUT_URL,
  POST_LOGIN_URL
} from '../../config/Oidc';
import CredentialsRepository from '../../repositories/CredentialsRepository';
import Credentials, { AuthProvider } from '../../models/Credentials';
import User from '../../models/User';
import { MailHelper } from '../../mail/MailHelper';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VerifyCallback = (err?: Error | null, user?: Express.User, info?: any) => void;

type passportProfile = {
  sub: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
};

const oidcStrategy = Router();

Issuer.discover(OIDC_ENDPOINT)
  .then((issuer: Issuer) => {
    const client = new issuer.Client({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uris: [CALLBACK_URL],
      post_logout_redirect_uris: [POST_LOGOUT_URL]
    });

    const params = {
      client_id: CLIENT_ID,
      redirect_uri: CALLBACK_URL,
      scope: 'openid email profile'
    };

    function verify(tokenSet: TokenSet, profile: passportProfile, cb: VerifyCallback) {
      const sessionLogout = client.endSessionUrl({ id_token_hint: tokenSet });

      CredentialsRepository.findByProvider(AuthProvider.OIDC, profile.sub)
        .then((credentialsInstance) => {
          if (credentialsInstance) {
            const user = credentialsInstance.user;
            user.sessionLogout = sessionLogout;
            return cb(null, user, { message: 'Logged In Successfully' });
          }

          const user = new User(profile.given_name, profile.family_name, profile.email);
          const credentials = new Credentials(user, AuthProvider.OIDC, profile.sub);

          return CredentialsRepository.createOne(credentials)
            .then((credentialsInstance) => {
              const newUser = credentialsInstance.user;
              newUser.sessionLogout = sessionLogout;
              MailHelper.sendUserCreated(newUser);
              return cb(null, newUser, {
                message: 'Created and logged In Successfully'
              });
            })
            .catch((err) => {
              console.log(err);
              return cb(new Error('Oops - Something went wrong.'), false);
            });
        })
        .catch((err) => {
          console.log(err);
          return cb(new Error('Oops - Something went wrong.'), false);
        });
    }

    passport.use('oidc', new OpenIDConnectStrategy({ client, params }, verify));

    oidcStrategy.get('/login', passport.authenticate('oidc'));

    oidcStrategy.get('/cb', passport.authenticate('oidc'), (req, res) =>
      res.redirect(POST_LOGIN_URL)
    );
  })
  .catch((err) => {
    console.log('Could not read OIDC Endpoint. Retry in 5 Seconds.');
    console.log(err);
    setTimeout(() => {
      process.kill(9);
    }, 5000);
  });

export default oidcStrategy;
