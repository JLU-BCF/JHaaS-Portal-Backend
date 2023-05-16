import { getSecret } from '../helpers/SecretHelper';

export default {
  issuer: process.env.OIDC_ISSUER || '',
  authorizationURL: process.env.OIDC_URL_AUTH || '',
  tokenURL: process.env.OIDC_URL_TOKEN || '',
  userInfoURL: process.env.OIDC_URL_INFO || '',
  callbackURL: process.env.OIDC_URL_CALLBACK || '',
  clientID: process.env.OIDC_CLIENT_ID || '',
  clientSecret: getSecret('OIDC_CLIENT_SECRET_FILE', 'OIDC_CLIENT_SECRET', '')
};
