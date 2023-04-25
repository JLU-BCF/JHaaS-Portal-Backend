import { Request, Response } from 'express';
import {
  parseJupyterHubChangeRequest,
  parseJupyterHubRequest,
  validationErrors
} from '../helpers/BodyParserHelper';
import { getUser } from '../helpers/AuthHelper';
import { JupyterHubRequest, JupyterHubRequestStatus } from '../models/JupyterHubRequest';
import JupyterHubRequestRepository from '../repositories/JupyterHubRequestRepository';
import { genericError } from '../helpers/ErrorHelper';
import * as MailHelper from '../helpers/EmailHelper';
import { DeleteResult } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function logErrorAndReturnGeneric500(err: any, res: Response) {
  console.log(err);
  return genericError.internalServerError(res);
}

class JupyterHubRequestController {
  /**************************
  Methods for REST Requests
  **************************/

  public readAll(req: Request, res: Response): void {
    JupyterHubRequestRepository.findAll()
      .then(([instances, count]) => res.json({ instances, count }))
      .catch((err) => logErrorAndReturnGeneric500(err, res));
  }

  public listOpen(req: Request, res: Response): void {
    JupyterHubRequestRepository.findOpen()
      .then(([instances, count]) => res.json({ instances, count }))
      .catch((err) => logErrorAndReturnGeneric500(err, res));
  }

  public list(req: Request, res: Response): void {
    JupyterHubRequestRepository.findByCreator(getUser(req))
      .then(([instances, count]) => res.json({ instances, count }))
      .catch((err) => logErrorAndReturnGeneric500(err, res));
  }

  public checkSlug(req: Request, res: Response): void {
    JupyterHubRequestRepository.findBySlug(req.params.slug)
      .then((jhRequest: JupyterHubRequest) => res.json(jhRequest ? false : true))
      .catch((err) => logErrorAndReturnGeneric500(err, res));
  }

  public read(req: Request, res: Response): void {
    const jhRequestId = req.params.id;
    const user = getUser(req);

    JupyterHubRequestRepository.findById(jhRequestId)
      .then((jhRequest) =>
        jhRequest?.userAllowed(user) ? res.json(jhRequest) : genericError.notFound(res)
      )
      .catch((err) => logErrorAndReturnGeneric500(err, res));
  }

  public readBySlug(req: Request, res: Response): void {
    const jhRequestSlug = req.params.slug;
    const user = getUser(req);

    JupyterHubRequestRepository.findBySlug(jhRequestSlug)
      .then((jhRequest: JupyterHubRequest) =>
        jhRequest?.userAllowed(user) ? res.json(jhRequest) : genericError.notFound(res)
      )
      .catch((err) => logErrorAndReturnGeneric500(err, res));
  }

  public create(req: Request, res: Response): void {
    if (validationErrors(req, res)) return;
    const jhRequest = parseJupyterHubRequest(req);

    JupyterHubRequestRepository.createOne(jhRequest)
      .then((instance) => {
        res.json(instance);
        MailHelper.sendJHRequestCreatedMail(instance);
      })
      .catch((err) => logErrorAndReturnGeneric500(err, res));
  }

  public accept(req: Request, res: Response): void {
    const jhRequestId = req.params.id;

    JupyterHubRequestRepository.findById(jhRequestId)
      .then((jhRequest: JupyterHubRequest) => {
        if (jhRequest?.changesAllowed()) {
          jhRequest.status = JupyterHubRequestStatus.ACCEPTED;
          return JupyterHubRequestRepository.updateOne(jhRequest)
            .then((instance) => res.json(instance))
            .catch((err) => logErrorAndReturnGeneric500(err, res));
        }
        return genericError.unprocessableEntity(res);
      })
      .catch((err) => logErrorAndReturnGeneric500(err, res));
  }

  public reject(req: Request, res: Response): void {
    const jhRequestId = req.params.id;

    JupyterHubRequestRepository.findById(jhRequestId)
      .then((jhRequest: JupyterHubRequest) => {
        if (jhRequest?.changesAllowed()) {
          jhRequest.status = JupyterHubRequestStatus.REJECTED;
          return JupyterHubRequestRepository.updateOne(jhRequest)
            .then((instance) => res.json(instance))
            .catch((err) => logErrorAndReturnGeneric500(err, res));
        }
        return genericError.unprocessableEntity(res);
      })
      .catch((err) => logErrorAndReturnGeneric500(err, res));
  }

  public cancel(req: Request, res: Response): void {
    const jhRequestId = req.params.id;
    const user = getUser(req);

    JupyterHubRequestRepository.findById(jhRequestId)
      .then((jhRequest: JupyterHubRequest) => {
        if (jhRequest?.userAndChangesAllowed(user)) {
          jhRequest.status = JupyterHubRequestStatus.CANCELED;
          jhRequest.cancelPendingChangeRequests();
          return JupyterHubRequestRepository.updateOne(jhRequest)
            .then((instance) => res.json(instance))
            .catch((err) => logErrorAndReturnGeneric500(err, res));
        }
        return genericError.unprocessableEntity(res);
      })
      .catch((err) => logErrorAndReturnGeneric500(err, res));
  }

  public createChangeRequest(req: Request, res: Response): void {
    const jhRequestId = req.body.id;
    const user = getUser(req);

    JupyterHubRequestRepository.findById(jhRequestId)
      .then((jhRequest: JupyterHubRequest) => {
        if (jhRequest?.userAndChangesAllowed(user)) {
          const jhChangeRequest = parseJupyterHubChangeRequest(req);
          jhRequest.cancelPendingChangeRequests();
          jhRequest.changeRequests.push(jhChangeRequest);
          return JupyterHubRequestRepository.updateOne(jhRequest)
            .then((instance) => res.json(instance))
            .catch((err) => logErrorAndReturnGeneric500(err, res));
        }
        return genericError.unprocessableEntity(res);
      })
      .catch((err) => logErrorAndReturnGeneric500(err, res));
  }

  public acceptChangeRequest(req: Request, res: Response): void {
    const changeRequestId = req.params.id;
    const user = getUser(req);

    JupyterHubRequestRepository.findByChangeRequest(changeRequestId)
      .then((jhRequest: JupyterHubRequest) => {
        if (jhRequest?.userAndChangesAllowed(user)) {
          jhRequest.applyChangeRequest(changeRequestId);
          return JupyterHubRequestRepository.updateOne(jhRequest)
            .then((instance) => res.json(instance))
            .catch((err) => logErrorAndReturnGeneric500(err, res));
        }
        return genericError.unprocessableEntity(res);
      })
      .catch((err) => logErrorAndReturnGeneric500(err, res));
  }

  public rejectChangeRequest(req: Request, res: Response): void {
    const changeRequestId = req.params.id;
    const user = getUser(req);

    JupyterHubRequestRepository.findByChangeRequest(changeRequestId)
      .then((jhRequest: JupyterHubRequest) => {
        if (jhRequest?.userAndChangesAllowed(user)) {
          jhRequest.setChangeRequestStatus(changeRequestId, JupyterHubRequestStatus.REJECTED);
          return JupyterHubRequestRepository.updateOne(jhRequest)
            .then((instance) => res.json(instance))
            .catch((err) => logErrorAndReturnGeneric500(err, res));
        }
        return genericError.unprocessableEntity(res);
      })
      .catch((err) => logErrorAndReturnGeneric500(err, res));
  }

  public cancelChangeRequest(req: Request, res: Response): void {
    const changeRequestId = req.params.id;
    const user = getUser(req);

    JupyterHubRequestRepository.findByChangeRequest(changeRequestId)
      .then((jhRequest: JupyterHubRequest) => {
        if (jhRequest?.userAndChangesAllowed(user)) {
          jhRequest.setChangeRequestStatus(changeRequestId, JupyterHubRequestStatus.CANCELED);
          return JupyterHubRequestRepository.updateOne(jhRequest)
            .then((instance) => res.json(instance))
            .catch((err) => logErrorAndReturnGeneric500(err, res));
        }
        return genericError.unprocessableEntity(res);
      })
      .catch((err) => logErrorAndReturnGeneric500(err, res));
  }

  public delete(req: Request, res: Response) {
    const jhRequestId = req.params.id;
    const user = getUser(req);

    // TODO: lock database row to prevent parallelism
    JupyterHubRequestRepository.findById(jhRequestId)
      .then((jhRequest: JupyterHubRequest) => {
        if (
          jhRequest &&
          jhRequest.changesAllowed() &&
          (jhRequest.creator.id == user.id || user.isAdmin)
        ) {
          return JupyterHubRequestRepository.deleteById(jhRequest.id)
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
          return genericError.unprocessableEntity(res, 'Changes are not allowed.');
        }
        return genericError.notFound(res);
      })
      .catch((err) => logErrorAndReturnGeneric500(err, res));
  }
}

export default new JupyterHubRequestController();
