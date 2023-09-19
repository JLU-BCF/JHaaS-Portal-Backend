import { getSecret } from '../helpers/SecretHelper';
import * as Minio from 'minio';

export const S3_TF_STATE_BUCKET = process.env.S3_TF_STATE_BUCKET || 'tf-state';
export const S3_JH_SPECS_BUCKET = process.env.S3_JH_SPECS_BUCKET || 'jh-specs';

export const minioClient = new Minio.Client({
  endPoint: process.env.S3_ENDPOINT || 'minio',
  port: Number(process.env.S3_PORT) || 9000,
  useSSL: [true, 'true', 1].includes(process.env.S3_SSL),
  accessKey: getSecret('S3_ACCESS_KEY_FILE', 'S3_ACCESS_KEY', ''),
  secretKey: getSecret('S3_SECRET_KEY_FILE', 'S3_SECRET_KEY', '')
});
