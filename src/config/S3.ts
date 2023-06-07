import { getSecret } from '../helpers/SecretHelper';
import * as Minio from 'minio';

export const minioClient = new Minio.Client({
  endPoint: process.env.S3_ENDPOINT || 'minio',
  port: Number(process.env.S3_PORT) || 9000,
  useSSL: [true, 'true', 1].includes(process.env.S3_SSL),
  accessKey: getSecret('S3_ACCESS_KEY_FILE', 'S3_ACCESS_KEY', ''),
  secretKey: getSecret('S3_SECRET_KEY_FILE', 'S3_SECRET_KEY', '')
});
