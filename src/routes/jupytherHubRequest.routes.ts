import { Router } from 'express';
import jhRequestController from '../controllers/JupyterHubRequestController';
import { jupyterHubRequestCreateValidation } from '../validators/JupyterHubRequestValidationRules';
import { adminGuard } from '../middlewares/AdminMiddleware';

const router: Router = Router();

// create new jupyter hub request
router.post('/', jupyterHubRequestCreateValidation, jhRequestController.create);

// list jupyter hub requests from user (my hubs)
router.get('/list', jhRequestController.list);

// get a specific jupyter hub object by id
router.get('/by-id/:id([0-9a-f-]+)', jhRequestController.read);

// get a specific jupyter hub object by slug
router.get('/by-slug/:slug([0-9a-z-]+)', jhRequestController.readBySlug);

// check if slug is free
router.get('/check-slug/:slug([0-9a-z-]+)', jhRequestController.checkSlug);

// create jupyter hub change request
router.put('/', jhRequestController.createChangeRequest);

// cancel jupyter hub request
router.put('/cancel/:id([0-9a-f-]+)', jhRequestController.cancel);

// cancel jupyter hub change request
router.put('/change/cancel/:id([0-9a-f-]+)', jhRequestController.cancelChangeRequest);

// Admin routes, protected by admin guard
const adminRouter: Router = Router();
adminRouter.use(adminGuard);

// get all jupyter hub requests
adminRouter.get('/', jhRequestController.readAll);

// get all open jupyter hub requests
adminRouter.get('/open', jhRequestController.listOpen);

// accept jupyter hub request
adminRouter.put('/accept/:id([0-9a-f-]+)', jhRequestController.accept);

// reject jupyter hub request
adminRouter.put('/reject/:id([0-9a-f-]+)', jhRequestController.reject);

// accept jupyter hub change request
adminRouter.put('/change/accept/:id([0-9a-f-]+)', jhRequestController.acceptChangeRequest);

// reject jupyter hub change request
adminRouter.put('/change/reject/:id([0-9a-f-]+)', jhRequestController.rejectChangeRequest);

// mark jupyter hub for redeployment
adminRouter.put('/redeploy/:id([0-9a-f-]+)', jhRequestController.redeploy);

// mark jupyter hub for degration
adminRouter.put('/degrade/:id([0-9a-f-]+)', jhRequestController.degrade);

router.use(adminRouter);

export default router;
