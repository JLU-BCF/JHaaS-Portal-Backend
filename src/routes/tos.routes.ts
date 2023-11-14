import { Router } from 'express';
import TosController from '../controllers/TosController';
import { adminGuard } from '../middlewares/AdminMiddleware';
import { authGuard } from '../middlewares/AuthenticatedMiddleware';
import { TosValidation } from '../validators/TosValidationRules';

const router: Router = Router();

router.get('/', TosController.listPublished);

router.get('/latest', TosController.latest);
router.get('/latest/html', TosController.latestHtml);
router.get('/next', TosController.next);
router.get('/next/html', TosController.nextHtml);

router.get('/:id([0-9a-f-]+)', TosController.read);

// Admin only routes
const adminRouter: Router = Router();
adminRouter.use(authGuard, adminGuard);

// List pending TOS = TOS which are waiting for beeing published
adminRouter.get('/pending', TosController.listPending);

// List all TOS (including drafts)
adminRouter.get('/all', TosController.listAll);

// Find TOS (including drafts)
adminRouter.get('/find/:id([0-9a-f-]+)', TosController.find);

// Create new TOS
adminRouter.post('/', TosValidation, TosController.create);

// Edit existing TOS - only non-published allowed
adminRouter.put('/:id([0-9a-f-]+)', TosValidation, TosController.update);

// Delete existing TOS - only non-published allowed
adminRouter.delete('/:id([0-9a-f-]+)', TosController.delete);

router.use(adminRouter);

export default router;
