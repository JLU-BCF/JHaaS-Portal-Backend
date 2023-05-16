import { Router } from 'express';
import passport from 'passport';
import OpenIDConnectStrategy from 'passport-openidconnect';
import OIDC_CONF from '../../config/Oidc';

import CredentialsRepository from '../../repositories/CredentialsRepository';
import { AuthProvider } from '../../models/Credentials';

const oidcStrategy = Router();

passport.use(
  new OpenIDConnectStrategy(OIDC_CONF, (issuer, profile, cb) => {
    CredentialsRepository.findByProvider(AuthProvider.OIDC, profile.id)
      .then((credentialsInstance) => {
        if (!credentialsInstance) {
          // Not yet in DB - creating!
          return cb('To be implemented.', false);
        }

        return cb(null, credentialsInstance.user, { message: 'Logged In Successfully' });
      })
      .catch((err) => {
        console.log(err);
        return cb('Oops - Something went wrong.', false);
      });
  })
);

oidcStrategy.get('/login', passport.authenticate('openidconnect'));

oidcStrategy.get(
  '/cb',
  passport.authenticate('openidconnect', { failureMessage: true }),
  (req, res) => res.redirect('/')
);

export default oidcStrategy;
