import { Router } from 'express';
import UserController from '../controllers/UserController';

const router: Router = Router();

// get all user objects
router.get('/', UserController.readAll);

// get a specific user object
router.get('/:id([0-9a-f-]+)', UserController.read);

// update a user
router.patch('/:id([0-9a-f-]+)', UserController.update);

// delete account
router.delete('/account/:id([0-9a-f-]+)', UserController.delete);

export default router;
