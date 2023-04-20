import { Router } from 'express';
import jhRequestController from '../controllers/JupyterHubRequestController';
import { jupyterHubRequestCreateValidation } from '../validators/JupyterHubRequestValidationRules';

const router: Router = Router();

// create new jupyter hub request
router.post('/', jupyterHubRequestCreateValidation, jhRequestController.create);

// get all jupyter hub requests
router.get('/', jhRequestController.readAll);

// get all open jupyter hub requests
router.get('/open', jhRequestController.listOpen);

// list jupyter hub requests from user (me)
router.get('/list', jhRequestController.list);

// get a specific jupyter hub object
router.get('/by-id/:id([0-9a-f-]+)', jhRequestController.read);

// get a specific jupyter hub object by slug
router.get('/by-slug/:slug([0-9a-z-]+)', jhRequestController.readBySlug);

// create update request
router.put('/', jhRequestController.update);

// create update request
router.put('/accept/:id([0-9a-f-]+)', jhRequestController.accept);

// create update request
router.put('/reject/:id([0-9a-f-]+)', jhRequestController.reject);

// cancel update request
router.put('/cancel/:id([0-9a-f-]+)', jhRequestController.cancel);

// create update request
router.put('/change/accept/:id([0-9a-f-]+)', jhRequestController.changeAccept);

// create update request
router.put('/change/reject/:id([0-9a-f-]+)', jhRequestController.changeReject);

// cancel update request
router.put('/change/cancel/:id([0-9a-f-]+)', jhRequestController.changeCancel);

export default router;
