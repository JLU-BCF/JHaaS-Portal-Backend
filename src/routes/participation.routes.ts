import { Router } from 'express';
import ParticipationController from '../controllers/ParticipationController';

const router: Router = Router();

// list jupyter hub participations from user (my participations)
router.get('/list', ParticipationController.readUserParticipations);

// // get a specific user object
// router.get('/:id([0-9a-f-]+)', UserController.read);

// // get login info
// router.get('/:id([0-9a-f-]+)/auth', CredentialsController.readAuthMethod);

// // update a user
// router.patch('/:id([0-9a-f-]+)', UserController.update);

// // delete account
// router.delete('/:id([0-9a-f-]+)', UserController.delete);

export default router;
