import { Request, Response } from 'express';
import ParticipationRepository from '../repositories/ParticipationRepository';
import { getUser } from '../helpers/AuthHelper';
import { genericError } from '../helpers/ErrorHelper';

class ParticipationController {
  public readUserParticipations(req: Request, res: Response) {
    ParticipationRepository.findByUser(getUser(req).id)
      .then(([instances, count]) => res.json({ instances, count }))
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }
}

export default new ParticipationController();
