import { body } from 'express-validator';
import jhRequestRepository from '../repositories/JupyterHubRequestRepository';

export const jupyterHubRequestCreateValidation = [
  body('name').exists().isString(),
  body('slug')
    .exists()
    .isString()
    .custom(checkSlugUnique),
  body('description').optional().isString(),
  body('userConf')
    .exists()
    .isObject()
    .custom(checkUserConf),
  body('containerImage').exists().isString(),
  body('startDate').exists().isDate(),
  body('endDate').exists().isDate()
];

async function checkSlugUnique(value: string) {
  return jhRequestRepository.findBySlug(value)
    .then((jhRequest) => {
      if (jhRequest) return Promise.reject('TAKEN');
      return Promise.resolve();
    })
    .catch((err) => {
      return err == 'TAKEN' ? Promise.reject('Slug already taken.') : Promise.reject();
    });
}

function checkUserConf(value: object) {
  const numbers = ['storagePerUser', 'cpusPerUser', 'ramPerUser', 'userCount'];
  for (let prop of numbers) {
    if (typeof value[prop] !== 'number') return false;
  }
  return true;
}