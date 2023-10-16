import { DataSource } from 'typeorm';
import User from '../models/User';
import Credentials from '../models/Credentials';
import { JupyterHubRequest, JupyterHubChangeRequest } from '../models/JupyterHubRequest';
import { getSecret } from '../helpers/SecretHelper';
import Participation from '../models/Participation';
import Tos from '../models/Tos';

export const NODE_ENV: string = process.env.NODE_ENV || '';
export const APP_PORT: number = Number(process.env.APP_PORT) || 8000;
export const JH_DOMAIN: string = process.env.JH_DOMAIN || 'jhaas.local';
export const RELEASE_NAME: string = process.env.RELEASE_NAME || 'jhaas-portal';
export const FRONTEND_URL: string = process.env.FRONTEND_URL || '/';

export const POST_LOGIN_URL = FRONTEND_URL.replace(/\/$/, '') + '/verify';
export const POST_LOGOUT_URL = FRONTEND_URL.replace(/\/$/, '') + '/verify';

export const NB_COUNT_FACTOR: number = Number(process.env.NB_COUNT_FACTOR) || 1;
export const NB_COUNT_MIN_ADD: number = Number(process.env.NB_COUNT_MIN_ADD) || 0;
export const NB_LIMITS_FACTOR: number = Number(process.env.NB_LIMITS_FACTOR) || 1;
export const NB_GUARANTEES_FACTOR: number = Number(process.env.NB_GUARANTEES_FACTOR) || 0.5;
export const NB_MIN_RAM: number = Number(process.env.NB_MIN_RAM) || 0.25;
export const NB_MIN_CPU: number = Number(process.env.NB_MIN_CPU) || 0.25;
export const NS_LIMITS_FACTOR: number = Number(process.env.NS_LIMITS_FACTOR) || 1;
// Add statics as preserved overhead for the JupyterHub added to the ns limit
export const NS_RAM_STATIC: number = Number(process.env.NS_RAM_STATIC) || 2;
export const NS_CPU_STATIC: number = Number(process.env.NS_CPU_STATIC) || 2;

export const DB_CONN: DataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.JHAAS_DB_USER || 'postgres',
  database: process.env.JHAAS_DB_NAME || 'postgres',
  password: getSecret('JHAAS_DB_PASS_FILE', 'JHAAS_DB_PASS', 'postgres'),
  entities: [User, Credentials, JupyterHubRequest, JupyterHubChangeRequest, Participation, Tos],
  synchronize: [true, 'true', 1].includes(process.env.TYPEORM_DB_SYNC),
  logging: [true, 'true', 1].includes(process.env.TYPEORM_DB_LOGGING),
  migrations: [
    `${__dirname}/../database-migrations/*.ts`,
    `${__dirname}/../database-migrations/*.js`
  ]
});
