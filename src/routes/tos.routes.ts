import { Router } from 'express';
import TosController from '../controllers/TosController';
import { adminGuard } from '../middlewares/AdminMiddleware';

const router: Router = Router();

router.get('/', TosController.list);

router.get('/latest', TosController.latest);

router.get('/:id([0-9a-f-]+)', TosController.read);

// Creation is Guarded. For admins only.
router.post('/', adminGuard, TosController.create);

export default router;
