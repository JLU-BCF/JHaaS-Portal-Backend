import { Router } from 'express';
import ParticipationController from '../controllers/ParticipationController';
import { leaderGuard } from '../middlewares/LeaderMiddleware';

const router: Router = Router();

// list jupyter hub participations from user (my participations)
router.get('/list', ParticipationController.readUserParticipations);

router.get('/hub/:slug([0-9a-z-]+)', ParticipationController.getHubForParticipation);

router.post('/hub/:slug([0-9a-z-]+)', ParticipationController.createParticipation);

router.get('/detail/:slug([0-9a-z-]+)', ParticipationController.getParticipation);

router.delete('/:participantId([0-9a-f-]+)/:hubId([0-9a-f-]+)', ParticipationController.cancelParticipation);

const leaderRouter: Router = Router();
leaderRouter.use(leaderGuard);

leaderRouter.get('/list/:slug([0-9a-z-]+)', ParticipationController.readHubParticipations);

leaderRouter.post(
  '/action/:action(accept|reject)/:participantId([0-9a-f-]+)/:hubId([0-9a-f-]+)',
  ParticipationController.participationAction
);

router.use(leaderRouter);

export default router;
