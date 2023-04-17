import { body } from 'express-validator';
import jhRequestRepository from '../repositories/JupyterHubRequestRepository';

export const jupyterHubRequestCreateValidation = [
  body('name').exists().isString(),
  body('slug').exists().isString().custom(checkSlugUnique),
  body('description').optional().isString(),
  body('userConf').exists().isObject(),
  body('userConf.storagePerUser').exists().isNumeric(),
  body('userConf.cpusPerUser').exists().isNumeric(),
  body('userConf.ramPerUser').exists().isNumeric(),
  body('userConf.userCount').exists().isNumeric(),
  body('containerImage').exists().isString(),
  body('startDate').exists().isDate(),
  body('endDate').exists().isDate()
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

// function checkUserConf(value: {[key: string]: string}) {
//   const numbers = ['storagePerUser', 'cpusPerUser', 'ramPerUser', 'userCount'];
//   for (const prop of numbers) {
//     console.log('checking', prop, 'is', value[prop], 'is', typeof value[prop] );
//     if (typeof value[prop] !== 'number') return false;
//   }
//   return true;
// }
