import { Request, Response } from 'express';
import ParticipationRepository from '../repositories/ParticipationRepository';
import { getUser } from '../helpers/AuthHelper';
import { genericError } from '../helpers/ErrorHelper';
import JupyterHubRequestRepository from '../repositories/JupyterHubRequestRepository';
import Participation, { ParticipationStatus } from '../models/Participation';
import { assignUserToGroup, removeUserFromGroup } from '../helpers/AuthentikApiHelper';
import { MailHelper } from '../mail/MailHelper';
import { DeleteResult } from 'typeorm';
import JupyterHubApiHelper from '../helpers/JupyterHubApiHelper';
import Verification, { Purpose } from '../models/Verification';
import { FRONTEND_URL } from '../config/Config';
import VerificationRepository from '../repositories/VerificationRepository';

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
        ParticipationRepository.findByUserAndHub(participantId, hubId, [
          'participant',
          'participant.credentials'
        ])
          .then(async (participationInstance) => {
            if (!participationInstance) {
              return genericError.notFound(res);
            }

            const participantAuthentikId =
              participationInstance.participant.credentials.authProviderId;

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
    const { verificationToken } = req.body;

    ParticipationRepository.findByUserAndHub(participantId, hubId, [
      'hub',
      'hub.creator',
      'hub.secrets',
      'participant',
      'participant.credentials'
    ])
      .then(async (participationInstance) => {
        if (!participationInstance) {
          return genericError.notFound(res);
        }

        if (participationInstance.hub.creator.id == user.id || user.isAdmin) {
          return executeParticipationDeletion(participationInstance, res);
        } else if (user.id == participantId) {
          if (verificationToken) {
            VerificationRepository.findBy({
              token: verificationToken,
              target: `${hubId}|${participantId}`,
              purpose: Purpose.REVOKE_PARTICIPATION
            })
              .then((verificationInstance) => {
                if (!verificationInstance) {
                  return genericError.unprocessableEntity(res, 'Token not applicable.');
                }
                if (verificationInstance.expiry.getTime() < new Date().getTime()) {
                  return genericError.unprocessableEntity(
                    res,
                    'The token has expired. Please start the process from the beginning.'
                  );
                }
                return executeParticipationDeletion(participationInstance, res);
              })
              .catch((err) => {
                console.log(err);
                return genericError.internalServerError(res);
              });
          } else {
            const verification = new Verification(user, Purpose.REVOKE_PARTICIPATION, {
              identifier: `${hubId}|${participantId}`,
              displayName: participationInstance.hub.name,
              url: `${FRONTEND_URL.replace(/\/$/, '')}/participation/revoke/${
                participationInstance.hub.slug
              }`
            });

            VerificationRepository.createOne(verification)
              .then((instance) => {
                MailHelper.participationRevocationVerification(instance);
                return res.json(
                  'We have sent you a verification link by e-mail. Please check your inbox.'
                );
              })
              .catch((err) => {
                console.log(err);
                return genericError.internalServerError(res);
              });
          }
        } else {
          return genericError.forbidden(res);
        }
      })
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }
}

async function executeParticipationDeletion(participation: Participation, res: Response) {
  // Remove from authentik group
  const authentikRemovalResult = await removeUserFromGroup(
    participation.participant.credentials.authProviderId,
    participation.hub.authentikGroup
  );

  let jupyterRemoveResult = true;
  if (participation.hub.hubUrl) {
    // Remove from jupyterhub
    const jhApiHelper = new JupyterHubApiHelper(
      participation.hub.hubUrl,
      participation.hub.secrets.apiToken
    );
    jupyterRemoveResult = await jhApiHelper.deleteUser(participation.participant.externalId);
  }

  if (!authentikRemovalResult || !jupyterRemoveResult) {
    // TODO: Send E-Mail to Admin!
  }

  return ParticipationRepository.deleteByUserAndHub(
    participation.participantId,
    participation.hubId
  )
    .then((deleteResult: DeleteResult) => {
      if (deleteResult.affected) {
        return res.json('Participation cancelled.');
      }
      return genericError.notFound(res);
    })
    .catch((err) => {
      console.log(err);
      return genericError.internalServerError(res);
    });
}

export default new ParticipationController();
