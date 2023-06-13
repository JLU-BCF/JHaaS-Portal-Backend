import { Request, Response } from 'express';
import ParticipationRepository from '../repositories/ParticipationRepository';
import { getUser } from '../helpers/AuthHelper';
import { genericError } from '../helpers/ErrorHelper';
import JupyterHubRequestRepository from '../repositories/JupyterHubRequestRepository';
import Participation from '../models/Participation';

class ParticipationController {
  public readUserParticipations(req: Request, res: Response) {
    ParticipationRepository.findByUser(getUser(req).id)
      .then(([instances, count]) => res.json({ instances, count }))
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }

  public getHubForParticipation(req: Request, res: Response) {
    const slug = req.params.slug;
    JupyterHubRequestRepository.findBySlug(slug)
      .then((instance) => res.json(instance.getCoreData()))
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });

  }

  public getParticipation(req: Request, res: Response) {
    const user = getUser(req);
    const slug = req.params.slug;
    JupyterHubRequestRepository.findBySlug(slug)
      .then((hubInstance) => {
        ParticipationRepository.findByUserAndHub(user.id, hubInstance.id)
          .then((instance) => res.json(instance))
          .catch((err) => {
            console.log(err);
            return genericError.internalServerError(res);
          });
      })
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }

  public createParticipation(req: Request, res: Response) {
    const user = getUser(req);
    const slug = req.params.slug;
    JupyterHubRequestRepository.findBySlug(slug)
      .then((hubInstance) => {
        ParticipationRepository.createOne(new Participation(user.id, hubInstance.id))
          .then((instance) => res.json(instance))
          .catch((err) => {
            console.log(err);
            return genericError.internalServerError(res);
          });
      })
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }
}

export default new ParticipationController();
