import { Router } from 'express';
import jhRequestController from '../controllers/JupyterHubRequestController';
import { jupyterHubRequestCreateValidation } from '../validators/JupyterHubRequestValidationRules';

const router: Router = Router();

// get all jupyter hub requests
router.get('/', jhRequestController.readAll);

// list jupyter hub requests from user (me)
router.get('/list', jhRequestController.list);

// get a specific jupyter hub object
router.get('/:id([0-9a-f-]+)', jhRequestController.read);

// get a specific jupyter hub object by slug
router.get('/:slug([0-9a-z-]+)', jhRequestController.readBySlug);

// create update request
router.post('/:id([0-9a-f-]+)', jhRequestController.update);

// create new jupyter hub request
router.post('/', jupyterHubRequestCreateValidation, jhRequestController.create);

export default router;
