import { Router } from 'express';
import { validate, Joi } from 'express-validation';
import UserController from '../controllers/UserController';

const updateValidation = {
  body: Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
  })
};

const router: Router = Router();

// TODO: just for testing
router.post(
  '/api/auth',
  UserController.echoJwt
);

router.post(
  '/auth/local/signup',
  UserController.createLocalUser
);

router.post(
  '/auth/local/login',
  UserController.authorizeLocalUser
);

// get all user objects
router.get(
  '/',
  UserController.readAll
);

// get a specific user object
router.get(
  '/:id([0-9a-f-]+)',
  UserController.read
);

// update a user
router.patch(
  '/:id([0-9a-f-]+)',
  validate(updateValidation, {}, {}),
  UserController.update
);

// delete account
router.delete(
  '/account/:id([0-9a-f-]+)',
  UserController.delete
);


export default router;
