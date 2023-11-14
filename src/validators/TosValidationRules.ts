import { body } from 'express-validator';

export const TosValidation = [
  body('textMarkdown').exists().isString(),
  body('validityStart').exists().isDate(),
  body('draft').exists().isBoolean(),
  body('draft')
    .if(body('publish').custom((publish) => publish === true))
    .custom((draft) => draft === false),
  body('publish').optional().isBoolean(),
  body('publish')
    .if(body('draft').custom((draft) => draft === false))
    .exists()
    .custom((publish) => publish === true)
];
