import { Router } from 'express';
import jhRequestController from '../controllers/JupyterHubRequestController';
import { jupyterHubRequestCreateValidation } from '../validators/JupyterHubRequestValidationRules';

const router: Router = Router();

// get all jupyter hub requests
router.get('/', jhRequestController.readAll);

// create new jupyter hub request
router.post('/', jupyterHubRequestCreateValidation, jhRequestController.create);

export default router;
