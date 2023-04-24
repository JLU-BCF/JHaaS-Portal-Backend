import nodemailer from 'nodemailer';

export const MAIL_HOST: string = process.env.MAIL_HOST || 'mailhog';
export const MAIL_PORT: number = Number(process.env.MAIL_PORT) || 2525;
export const MAIL_SECURE: boolean = ['true', true, 1].includes(process.env.MAIL_SECURE);

// TODO: options for authenticated mail delivery

export const mailTransporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: MAIL_SECURE
});