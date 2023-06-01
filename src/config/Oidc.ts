import { getSecret } from '../helpers/SecretHelper';
import { FRONTEND_LOGIN_URL, FRONTEND_LOGOUT_URL } from './Config';

export const CLIENT_ID = process.env.OIDC_CLIENT_ID || '';
export const CLIENT_SECRET = getSecret('OIDC_CLIENT_SECRET_FILE', 'OIDC_CLIENT_SECRET', '');
export const CALLBACK_URL = process.env.OIDC_URL_CALLBACK || '';
export const OIDC_ENDPOINT = process.env.OIDC_ENDPOINT || '';
export const POST_LOGOUT_URL = FRONTEND_LOGOUT_URL;
export const POST_LOGIN_URL = FRONTEND_LOGIN_URL;

export const FORCE_OIDC_REACHABLE = ['true', true, 1].includes(process.env.FORCE_OIDC_REACHABLE);
export const AUTHENTIK_API_ENDPOINT = process.env.AUTHENTIK_API_ENDPOINT || '';
export const AUTHENTIK_API_SECRET = process.env.AUTHENTIK_API_SECRET || '';
export const AUTHENTIK_JH_GROUP_NAME = process.env.AUTHENTIK_JH_GROUP_NAME || 'jupyterhubs';
