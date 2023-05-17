import { getSecret } from '../helpers/SecretHelper';
import RedisStore from 'connect-redis';
import { createClient as createRedisClient } from 'redis';
import { type SessionOptions } from 'express-session';

const SESSION_COOKIE_NAME: string = process.env.SESSION_COOKIE_NAME || 'session';
const SESSION_COOKIE_PATH: string = process.env.SESSION_COOKIE_PATH || '/';
const SESSION_COOKIE_MAX_AGE: number = Number(process.env.SESSION_COOKIE_MAX_AGE) || 28800000;
const SESSION_COOKIE_SECRET: string | string[] = JSON.parse(
  getSecret('SESSION_COOKIE_SECRET_FILE', 'SESSION_COOKIE_SECRET', '"super-secret-session-cookie"')
);
const SESSION_COOKIE_SECURE: boolean =
  [true, 'true', 1].includes(process.env.SESSION_COOKIE_SECURE) || false;

const SESSION_CONFIG: SessionOptions = {
  name: SESSION_COOKIE_NAME,
  secret: SESSION_COOKIE_SECRET,
  saveUninitialized: false,
  resave: false,
  rolling: true,
  cookie: {
    maxAge: SESSION_COOKIE_MAX_AGE,
    sameSite: 'strict',
    secure: SESSION_COOKIE_SECURE,
    path: SESSION_COOKIE_PATH
  }
};

const SESSION_STORAGE: string = process.env.SESSION_STORAGE || '';

if (SESSION_STORAGE === 'redis') {
  // redis[s]://[[username][:password]@][host][:port][/db-number]
  const SESSION_STORAGE_URL: string = process.env.SESSION_STORAGE_URL || '';
  const SESSION_STORAGE_USER: string = process.env.SESSION_STORAGE_USER || null;
  const SESSION_STORAGE_PASS: string = process.env.SESSION_STORAGE_PASS || null;
  const SESSION_STORAGE_PREFIX: string = process.env.SESSION_STORAGE_PREFIX || null;

  const redisClient = createRedisClient({
    url: SESSION_STORAGE_URL,
    username: SESSION_STORAGE_USER,
    password: SESSION_STORAGE_PASS
  });

  redisClient.connect().catch(console.error);

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: SESSION_STORAGE_PREFIX
  });

  SESSION_CONFIG.store = redisStore;
}

export default SESSION_CONFIG;
