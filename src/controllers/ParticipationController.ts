import { Request, Response } from 'express';
import ParticipationRepository from '../repositories/ParticipationRepository';
import { getUser, isUserAdminOrSelf } from '../helpers/AuthHelper';
import { genericError } from '../helpers/ErrorHelper';
import JupyterHubRequestRepository from '../repositories/JupyterHubRequestRepository';
import Participation, { ParticipationStatus } from '../models/Participation';
import { assignUserToGroup, removeUserFromGroup } from '../helpers/AuthentikApiHelper';
import { MailHelper } from '../mail/MailHelper';
import { DeleteResult } from 'typeorm';

class ParticipationController {
  public readUserParticipations(req: Request, res: Response) {
    ParticipationRepository.findByUser(getUser(req).id)
      .then(([instances, count]) => res.json({ instances, count }))
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }

  // protected by leaderguard
  public readHubParticipations(req: Request, res: Response) {
    const user = getUser(req);
    const slug = req.params.slug;
    JupyterHubRequestRepository.findBySlug(slug)
      .then((hubInstance) => {
        // check if user is creator or admin
        if (!hubInstance || (hubInstance.creator.id !== user.id && !user.isAdmin)) {
          return genericError.notFound(res);
        }
        ParticipationRepository.findByHub(hubInstance.id)
          .then(([instances, count]) => res.json({ instances, count }))
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

  public getHubForParticipation(req: Request, res: Response) {
    const slug = req.params.slug;
    JupyterHubRequestRepository.findBySlug(slug)
      .then((hubInstance) => {
        if (!hubInstance) {
          return genericError.notFound(res);
        }
        return res.json(hubInstance.getCoreData());
      })
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
        if (!hubInstance) {
          return genericError.notFound(res);
        }
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
        if (!hubInstance || !hubInstance.participationAllowed()) {
          return genericError.notFound(res);
        }
        if (hubInstance.creator.id == user.id) {
          return genericError.unprocessableEntity(res, 'This is your own hub');
        }
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

  // protected by leaderguard
  public participationAction(req: Request, res: Response) {
    const user = getUser(req);
    const participantId = req.params.participantId;
    const hubId = req.params.hubId;
    const action = req.params.action;
    JupyterHubRequestRepository.findById(hubId)
      .then((hubInstance) => {
        // check if user is creator or admin
        if (
          !hubInstance ||
          (hubInstance.creator.id !== user.id && !user.isAdmin) ||
          !hubInstance.participationAllowed()
        ) {
          return genericError.notFound(res);
        }
        ParticipationRepository.findByUserAndHub(participantId, hubId, ['participant'])
          .then(async (participationInstance) => {
            if (!participationInstance) {
              return genericError.notFound(res);
            }

            const participantAuthentikId = await participationInstance.participant.authentikId();
            if (!participantAuthentikId) {
              return genericError.internalServerError(res);
            }

            if (
              participationInstance.status == ParticipationStatus.ACEPPTED &&
              action == 'reject'
            ) {
              // Remove from group
              const removalResult = await removeUserFromGroup(
                participantAuthentikId,
                hubInstance.authentikGroup
              );
              if (!removalResult) {
                return genericError.internalServerError(res);
              }
            }

            if (
              participationInstance.status !== ParticipationStatus.ACEPPTED &&
              action == 'accept'
            ) {
              // Add to group
              const assignmentResult = await assignUserToGroup(
                participantAuthentikId,
                hubInstance.authentikGroup
              );
              if (!assignmentResult) {
                return genericError.internalServerError(res);
              }
            }

            participationInstance.status =
              action == 'accept' ? ParticipationStatus.ACEPPTED : ParticipationStatus.REJECTED;

            ParticipationRepository.updateOne(participationInstance)
              .then((instance) => {
                res.json(instance);
                if (instance.status == ParticipationStatus.ACEPPTED) {
                  MailHelper.sendParticipationAccepted(
                    hubInstance,
                    participationInstance.participant
                  );
                } else {
                  MailHelper.sendParticipationRejected(
                    hubInstance,
                    participationInstance.participant
                  );
                }
              })
              .catch((err) => {
                console.log(err);
                return genericError.internalServerError(res);
              });
          })
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

  public async cancelParticipation(req: Request, res: Response) {
    const user = getUser(req);
    const { hubId, participantId } = req.params;

    if (!isUserAdminOrSelf(req, participantId)) {
      const hubInstance = await JupyterHubRequestRepository.findById(hubId);
      if (!hubInstance || hubInstance.creator.id !== user.id) {
        return genericError.forbidden(res);
      }
    }

    ParticipationRepository.deleteByUserAndHub(participantId, hubId)
      .then((deleteResult: DeleteResult) => {
        if (deleteResult.affected) {
          return res.json('Deleted.');
        }
        return genericError.notFound(res);
      })
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }
}

export default new ParticipationController();
