import { body } from 'express-validator';

export const localSignupValidation = [
  body('email').exists().isEmail(),
  body('firstName').exists().isString(),
  body('lastName').exists().isString(),
  body('password').exists().isString()
];

export const localLoginValidation = [
  body('email').exists().isEmail(),
  body('password').exists().isString()
];

export const localUpdateEmailValidation = [
  body('email').exists().isEmail(),
  body('password').exists().isString()
];

export const localUpdatePasswordValidation = [
  body('oldPassword').exists().isString(),
  body('newPassword').exists().isString()
];
