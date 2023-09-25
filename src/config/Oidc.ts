import { getSecret } from '../helpers/SecretHelper';

export const CLIENT_ID = process.env.OIDC_CLIENT_ID || '';
export const CLIENT_SECRET = getSecret('OIDC_CLIENT_SECRET_FILE', 'OIDC_CLIENT_SECRET', '');
export const CALLBACK_URL = process.env.OIDC_URL_CALLBACK || '';
export const OIDC_ENDPOINT = process.env.OIDC_ENDPOINT || '';

export const OIDC_FORCE_REACHABILITY = ['true', true, 1].includes(
  process.env.OIDC_FORCE_REACHABILITY
);

export const AUTHENTIK_API_ENDPOINT = process.env.AUTHENTIK_API_ENDPOINT || '';
export const AUTHENTIK_API_SECRET = process.env.AUTHENTIK_API_SECRET || '';
export const AUTHENTIK_INVALIDATION_FLOW = process.env.AUTHENTIK_INVALIDATION_FLOW || '';
export const AUTHENTIK_JH_GROUP_NAME = process.env.AUTHENTIK_JH_GROUP_NAME || 'jupyterhubs';
