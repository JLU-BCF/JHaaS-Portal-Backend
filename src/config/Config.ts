import fs from 'fs';
import { DataSource } from 'typeorm';
import User from '../models/User';
import Credentials from '../models/Credentials';

export const JWT_SECRET: string = getDockerSecret('JWT_SECRET_FILE', 'JWT_SECRET', 'change-me');

export const NODE_ENV: string = process.env.NODE_ENV || '';

export const DB_CONN: DataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  database: process.env.POSTGRES_DB || 'postgres',
  password: getDockerSecret('POSTGRES_PASSWORD_FILE', 'POSTGRES_PASSWORD', 'postgres'),
  entities: [User, Credentials],
  synchronize: true,
  logging: true
});

function getDockerSecret(
  secretFileEnv: string,
  secretPlainEnv?: string,
  secretDefault?: string
): string | undefined {
  // (secretPlainEnv || secretDefault) may be undefined - that's ok!
  let secret = process.env[secretPlainEnv] || secretDefault;

  const secretFile = process.env[secretFileEnv];
  if (secretFile && fs.existsSync(secretFile)) {
    try {
      secret = fs.readFileSync(secretFile).toString();
    } catch (err: unknown) {
      console.log('Could not read pw file. Using Fallback.', err);
    }
  }

  // can only be undefined if no default is given!
  return secret;
}

export const APP_PORT: number = Number(process.env.APP_PORT) || 8000;
