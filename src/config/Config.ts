import { DataSource } from 'typeorm';
import User from '../models/User';
import Credentials from '../models/Credentials';
import { JupyterHubRequest, JupyterHubChangeRequest } from '../models/JupyterHubRequest';
import { getSecret } from '../helpers/SecretHelper';

export const NODE_ENV: string = process.env.NODE_ENV || '';
export const APP_PORT: number = Number(process.env.APP_PORT) || 8000;
export const APP_PATH: string = process.env.APP_PATH || '/api';
export const JH_DOMAIN: string = process.env.JH_DOMAIN || 'jhaas.local';

export const JWT_SECRET_A: string = getSecret('JWT_SECRET_A_FILE', 'JWT_SECRET_A', 'secret-slot-a');
export const JWT_SECRET_B: string = getSecret('JWT_SECRET_B_FILE', 'JWT_SECRET_B', 'secret-slot-b');
export const JWT_ACTIVE_SECRET: string = process.env.JWT_ACTIVE_SECRET || 'A';
export const JWT_EXPIRY: number = Number(process.env.JWT_EXPIRY) || 900;
export const JWT_REFRESH_EXPIRY: number = Number(process.env.JWT_REFRESH_EXPIRY) || 604800;
export const JWT_REFRESH_COOKIE_SECURE: boolean =
  [true, 'true', 1].includes(process.env.JWT_REFRESH_COOKIE_SECURE) || false;

export const DB_CONN: DataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  database: process.env.POSTGRES_DB || 'postgres',
  password: getSecret('POSTGRES_PASSWORD_FILE', 'POSTGRES_PASSWORD', 'postgres'),
  entities: [User, Credentials, JupyterHubRequest, JupyterHubChangeRequest],
  synchronize: false,
  logging: true,
  migrations: ['database-migrations/*.ts']
});
