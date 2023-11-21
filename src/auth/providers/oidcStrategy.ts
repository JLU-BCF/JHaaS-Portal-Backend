import { Router } from 'express';
import passport from 'passport';
import { Issuer, Strategy as OpenIDConnectStrategy, TokenSet } from 'openid-client';

import {
  OIDC_ENDPOINT,
  CALLBACK_URL,
  CLIENT_ID,
  CLIENT_SECRET,
  OIDC_FORCE_REACHABILITY,
  AUTHENTIK_INVALIDATION_FLOW
} from '../../config/Oidc';
import { POST_LOGOUT_URL, POST_LOGIN_URL } from '../../config/Config';
import CredentialsRepository from '../../repositories/CredentialsRepository';
import Credentials, { AuthProvider } from '../../models/Credentials';
import UserRepository from '../../repositories/UserRepository';
import User from '../../models/User';
import { MailHelper } from '../../mail/MailHelper';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VerifyCallback = (err?: Error | null, user?: Express.User, info?: any) => void;

type passportProfile = {
  sub: string;
  email: string;
  name: string;
  given_name?: string;
  family_name?: string;
  groups?: string[];
  external_id?: string;

  // allow any additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

const oidcStrategy = Router();

Issuer.discover(OIDC_ENDPOINT)
  .then((issuer: Issuer) => {
    console.log('OIDC: ', 'discovered.');

    const client = new issuer.Client({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uris: [CALLBACK_URL],
      post_logout_redirect_uris: [POST_LOGOUT_URL]
    });

    const params = {
      client_id: CLIENT_ID,
      redirect_uri: CALLBACK_URL,
      scope: 'openid email profile user-attributes'
    };

    function verify(tokenSet: TokenSet, profile: passportProfile, cb: VerifyCallback) {
      let isAdmin = false;
      let isLead = false;
      const firstName = profile.given_name || profile.name;
      const lastName = profile.family_name || profile.name;
      const email = profile.email;
      // const sessionLogout = client.endSessionUrl({ id_token_hint: tokenSet });
      const sessionLogout = `${AUTHENTIK_INVALIDATION_FLOW}/?redirect=${encodeURIComponent(
        POST_LOGOUT_URL
      )}`;
      const externalId = profile.external_id || null;

      if (profile.groups?.length) {
        isAdmin = profile.groups.includes('portal-admins');
        isLead = profile.groups.includes('portal-leaders');
      }

      CredentialsRepository.findByProvider(AuthProvider.OIDC, profile.sub)
        .then((credentialsInstance) => {
          if (credentialsInstance) {
            const user = credentialsInstance.user;

            if (user.sync({ isAdmin, isLead, firstName, lastName, email, externalId })) {
              UserRepository.updateOne(user);
            }

            user.sessionLogout = sessionLogout;
            return cb(null, user, { message: 'Logged In Successfully' });
          }

          const user = new User(firstName, lastName, email, isAdmin, isLead, externalId);
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
    console.log('Could not read OIDC Endpoint: ', OIDC_ENDPOINT);
    console.log(err);
    if (OIDC_FORCE_REACHABILITY) {
      console.log('Kill to try again in 5 seconds.');
      setTimeout(() => {
        process.kill(9);
      }, 5000);
    }
  });

export default oidcStrategy;
