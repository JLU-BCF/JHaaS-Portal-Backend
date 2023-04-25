import { body } from 'express-validator';
import jhRequestRepository from '../repositories/JupyterHubRequestRepository';

const jupyterHubRequestBaseValidation = [
  body('name').exists().isString(),
  body('description').optional().isString(),
  body('userConf').exists().isObject(),
  body('userConf.storagePerUser').exists().isNumeric(),
  body('userConf.cpusPerUser').exists().isNumeric(),
  body('userConf.ramPerUser').exists().isNumeric(),
  body('userConf.userCount').exists().isNumeric(),
  body('containerImage').exists().isString(),
  body('startDate').exists().isDate(),
  body('endDate').exists().isDate(),
  body('tosConfirmation').exists().isBoolean().contains(true)
];

export const jupyterHubRequestCreateValidation = [
  body('slug').exists().isString().custom(checkSlugUnique),
  ...jupyterHubRequestBaseValidation
];

export const jupyterHubRequestUpdateValidation = [
  body('id').exists().isString().isUUID(),
  ...jupyterHubRequestBaseValidation
];

async function checkSlugUnique(value: string) {
  return jhRequestRepository
    .findBySlug(value)
    .then((jhRequest) => {
      if (jhRequest) return Promise.reject('TAKEN');
      return Promise.resolve();
    })
    .catch((err) => {
      return err == 'TAKEN' ? Promise.reject('Slug already taken.') : Promise.reject();
    });
}
