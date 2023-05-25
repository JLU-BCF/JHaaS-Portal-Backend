import { DataSource } from 'typeorm';
import User from '../models/User';
import Credentials from '../models/Credentials';
import { JupyterHubRequest, JupyterHubChangeRequest } from '../models/JupyterHubRequest';
import { getSecret } from '../helpers/SecretHelper';
import Participation from '../models/Participation';

export const NODE_ENV: string = process.env.NODE_ENV || '';
export const APP_PORT: number = Number(process.env.APP_PORT) || 8000;
export const APP_PATH: string = process.env.APP_PATH || '/api';
export const FRONTEND_URL: string = process.env.FRONTEND_URL || '/';
export const FRONTEND_LOGIN_URL: string = process.env.FRONTEND_LOGIN_URL || '/auth/verify';
export const FRONTEND_LOGOUT_URL: string = process.env.FRONTEND_LOGOUT_URL || '/auth/logout';
export const JH_DOMAIN: string = process.env.JH_DOMAIN || 'jhaas.local';
export const RELEASE_NAME: string = process.env.RELEASE_NAME || 'jhaas-portal';

export const DB_CONN: DataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  database: process.env.POSTGRES_DB || 'postgres',
  password: getSecret('POSTGRES_PASSWORD_FILE', 'POSTGRES_PASSWORD', 'postgres'),
  entities: [
    User,
    Credentials,
    JupyterHubRequest,
    JupyterHubChangeRequest,
    Participation
  ],
  synchronize: NODE_ENV != 'production',
  logging: NODE_ENV != 'production',
  migrations: [
    `${__dirname}/../database-migrations/*.ts`,
    `${__dirname}/../database-migrations/*.js`
  ]
});
