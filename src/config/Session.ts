import { getSecret } from '../helpers/SecretHelper';

export const SESSION_COOKIE_NAME: string = process.env.SESSION_COOKIE_NAME || 'session';
export const SESSION_COOKIE_MAX_AGE: number =
  Number(process.env.SESSION_COOKIE_MAX_AGE) || 28800000;
export const SESSION_COOKIE_SECRET: string = getSecret(
  'SESSION_COOKIE_SECRET_FILE',
  'SESSION_COOKIE_SECRET',
  'super-secret-session-cookie'
);
export const SESSION_COOKIE_SECURE: boolean =
  [true, 'true', 1].includes(process.env.SESSION_COOKIE_SECURE) || false;
