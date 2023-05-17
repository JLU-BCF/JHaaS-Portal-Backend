import { Router } from 'express';
import passport from 'passport';
import OpenIDConnectStrategy from 'passport-openidconnect';
import OIDC_CONF from '../../config/Oidc';

import CredentialsRepository from '../../repositories/CredentialsRepository';
import Credentials, { AuthProvider } from '../../models/Credentials';
import User from '../../models/User';
import { MailHelper } from '../../mail/MailHelper';

const oidcStrategy = Router();

passport.use(
  new OpenIDConnectStrategy(
    OIDC_CONF,
    (
      issuer: string,
      profile: OpenIDConnectStrategy.Profile,
      cb: OpenIDConnectStrategy.VerifyCallback
    ) => {
      CredentialsRepository.findByProvider(AuthProvider.OIDC, profile.id)
        .then((credentialsInstance) => {
          if (credentialsInstance) {
            return cb(null, credentialsInstance.user, { message: 'Logged In Successfully' });
          }

          if (profile.emails?.length > 0 && profile.name) {
            const user = new User(
              profile.name.givenName,
              profile.name.familyName,
              profile.emails[0].value
            );
            const credentials = new Credentials(user, AuthProvider.OIDC, profile.id);

            return CredentialsRepository.createOne(credentials)
              .then((credentialsInstance) => {
                MailHelper.sendUserCreated(credentialsInstance.user);
                return cb(null, credentialsInstance.user, {
                  message: 'Created and logged In Successfully'
                });
              })
              .catch((err) => {
                console.log(err);
                return cb(new Error('Oops - Something went wrong.'), false);
              });
          }

          return cb(new Error('Oops - Something went wrong.'), false);
        })
        .catch((err) => {
          console.log(err);
          return cb(new Error('Oops - Something went wrong.'), false);
        });
    }
  )
);

oidcStrategy.get('/login', passport.authenticate('openidconnect'));

oidcStrategy.get('/cb', passport.authenticate('openidconnect'), (req, res) => res.redirect('/'));

export default oidcStrategy;
