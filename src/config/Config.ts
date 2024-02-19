export const NODE_ENV: string = process.env.NODE_ENV || '';
export const APP_PORT: number = Number(process.env.APP_PORT) || 8000;
export const JH_DOMAIN: string = process.env.JH_DOMAIN || 'jhaas.local';
export const RELEASE_NAME: string = process.env.RELEASE_NAME || 'jhaas-portal';
export const FRONTEND_URL: string = process.env.FRONTEND_URL || '/';

export const POST_LOGIN_URL = FRONTEND_URL.replace(/\/$/, '') + '/verify';
export const POST_LOGOUT_URL = FRONTEND_URL.replace(/\/$/, '') + '/verify';
