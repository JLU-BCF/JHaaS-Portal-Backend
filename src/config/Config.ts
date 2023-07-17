import { DataSource } from 'typeorm';
import User from '../models/User';
import Credentials from '../models/Credentials';
import { JupyterHubRequest, JupyterHubChangeRequest } from '../models/JupyterHubRequest';
import { getSecret } from '../helpers/SecretHelper';
import Participation from '../models/Participation';

export const NODE_ENV: string = process.env.NODE_ENV || '';
export const APP_PORT: number = Number(process.env.APP_PORT) || 8000;
export const APP_PATH: string = process.env.APP_PATH || '/api';
export const JH_DOMAIN: string = process.env.JH_DOMAIN || 'jhaas.local';
export const RELEASE_NAME: string = process.env.RELEASE_NAME || 'jhaas-portal';
export const FRONTEND_URL: string = process.env.FRONTEND_URL || '/';

export const FRONTEND_LOGIN_URL = FRONTEND_URL.replace(/\/$/, '') + '/verify';
export const FRONTEND_LOGOUT_URL = FRONTEND_URL.replace(/\/$/, '') + '/verify';

export const DB_CONN: DataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.JHAAS_DB_USER || 'postgres',
  database: process.env.JHAAS_DB_NAME || 'postgres',
  password: getSecret('JHAAS_DB_PASS_FILE', 'JHAAS_DB_PASS', 'postgres'),
  entities: [User, Credentials, JupyterHubRequest, JupyterHubChangeRequest, Participation],
  // synchronize: NODE_ENV != 'production',
  synchronize: [true, 'true', 1].includes(process.env.TYPEORM_DB_SYNC),
  logging: NODE_ENV != 'production',
  migrations: [
    `${__dirname}/../database-migrations/*.ts`,
    `${__dirname}/../database-migrations/*.js`
  ]
});
