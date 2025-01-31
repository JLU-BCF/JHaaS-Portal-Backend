import { getSecret } from '../helpers/SecretHelper';
import * as Minio from 'minio';

export const S3_TF_STATE_BUCKET = process.env.S3_TF_STATE_BUCKET || 'tf-state';
export const S3_JH_SPECS_BUCKET = process.env.S3_JH_SPECS_BUCKET || 'jh-specs';

// S3 to store system information - must be available where Portal is deployed
export const systemMinioClient = new Minio.Client({
  endPoint: process.env.S3_ENDPOINT || 'minio',
  port: Number(process.env.S3_PORT) || 9000,
  useSSL: [true, 'true', 1].includes(process.env.S3_SSL),
  accessKey: getSecret('S3_ACCESS_KEY_FILE', 'S3_ACCESS_KEY', ''),
  secretKey: getSecret('S3_SECRET_KEY_FILE', 'S3_SECRET_KEY', '')
});

// S3 to store shared data for NBs - must be available where notebooks are deployed
export const dataMinioClient = new Minio.Client({
  endPoint: process.env.S3_DATA_ENDPOINT || 'minio',
  port: Number(process.env.S3_DATA_PORT) || 9000,
  useSSL: [true, 'true', 1].includes(process.env.S3_DATA_SSL),
  accessKey: getSecret('S3_DATA_ACCESS_KEY_FILE', 'S3_DATA_ACCESS_KEY', ''),
  secretKey: getSecret('S3_DATA_SECRET_KEY_FILE', 'S3_DATA_SECRET_KEY', '')
});
