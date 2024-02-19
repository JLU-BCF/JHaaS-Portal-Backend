import { DataSource } from 'typeorm';
import User from '../models/User';
import Credentials from '../models/Credentials';
import { JupyterHubRequest, JupyterHubChangeRequest } from '../models/JupyterHubRequest';
import { getSecret } from '../helpers/SecretHelper';
import Participation from '../models/Participation';
import Tos from '../models/Tos';
import JupyterHubSecrets from '../models/JupyterHubSecrets';
import Verification from '../models/Verification';

export const DB_CONN: DataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.JHAAS_DB_USER || 'postgres',
  database: process.env.JHAAS_DB_NAME || 'postgres',
  password: getSecret('JHAAS_DB_PASS_FILE', 'JHAAS_DB_PASS', 'postgres'),
  entities: [
    User,
    Credentials,
    JupyterHubRequest,
    JupyterHubChangeRequest,
    JupyterHubSecrets,
    Participation,
    Verification,
    Tos
  ],
  synchronize: [true, 'true', 1].includes(process.env.TYPEORM_DB_SYNC),
  logging: [true, 'true', 1].includes(process.env.TYPEORM_DB_LOGGING),
  migrations: [
    `${__dirname}/../database-migrations/*.ts`,
    `${__dirname}/../database-migrations/*.js`
  ]
});
