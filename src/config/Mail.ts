import nodemailer from 'nodemailer';

export const MAIL_HOST: string = process.env.MAIL_HOST || 'mailhog';
export const MAIL_PORT: number = Number(process.env.MAIL_PORT) || 2525;
export const MAIL_SECURE: boolean = ['true', true, 1].includes(process.env.MAIL_SECURE);

export const MAIL_USER: string = process.env.MAIL_USER;
export const MAIL_PASS: string = process.env.MAIL_PASS;

export const MAIL_TEMPLATE_DIR: string =
  process.env.MAIL_TEMPLATE_DIR || `${__dirname}/../../templates/mail`;

export const MAIL_FROM: string = process.env.MAIL_FROM || 'portal@jhaas.local';
export const MAIL_FROM_NAME: string = process.env.MAIL_FROM_NAME || 'JHaaS Portal';
export const MAIL_COPY_ADDRESSES: string[] = process.env.MAIL_COPY_ADDRESSES
  ? JSON.parse(process.env.MAIL_COPY_ADDRESSES)
  : ['admins@jhaas.local'];

export const mailTransporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: MAIL_SECURE,
  auth: MAIL_USER && MAIL_PASS ? { user: MAIL_USER, pass: MAIL_PASS } : undefined
});
