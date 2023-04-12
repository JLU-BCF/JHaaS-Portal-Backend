import { Request, Response } from 'express';
import { parseJupyterHubRequest, validationErrors } from '../helpers/BodyParserHelper';
import { getUser } from '../helpers/AuthHelper';
import { JupyterHubRequest } from '../models/JupyterHubRequest';
import JupyterHubRequestRepository from '../repositories/JupyterHubRequestRepository';
import { genericError } from '../helpers/ErrorHelper';
import { DeleteResult } from 'typeorm';

class JupyterHubRequestController {
  /**************************
  Methods for REST Requests
  **************************/

  public readAll(req: Request, res: Response): void {
    if (!getUser(req).isAdmin) {
      return genericError.forbidden(res);
    }

    JupyterHubRequestRepository.findAll()
      .then((jhRequests: JupyterHubRequest[]) => {
        return res.json(jhRequests);
      })
      .catch((err: unknown) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }

  public read(req: Request, res: Response): void {
    const jhRequestId = req.params.id;
    const user = getUser(req);

    JupyterHubRequestRepository.findById(jhRequestId)
      .then((jhRequest: JupyterHubRequest) => {
        if (jhRequest && (jhRequest.creator.id == user.id || user.isAdmin)) {
          return res.json(jhRequest);
        }
        return genericError.notFound(res);
      })
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }

  public create(req: Request, res: Response): void {
    if (validationErrors(req, res)) return;
    const jhRequest = parseJupyterHubRequest(req);
    JupyterHubRequestRepository.createOne(jhRequest)
      .then((jhRequestInstance: JupyterHubRequest) => {
        return res.json(jhRequestInstance);
      })
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }

  public update(req: Request, res: Response): void {
    // TODO: no traditional updates, but changerequests
  }

  public delete(req: Request, res: Response) {
    const jhRequestId = req.params.id;
    const user = getUser(req);

    // TODO: lock database row to prevent parallelism
    JupyterHubRequestRepository.findById(jhRequestId)
      .then((jhRequest: JupyterHubRequest) => {
        if (
          jhRequest &&
          jhRequest.changesAllowed &&
          (jhRequest.creator.id == user.id || user.isAdmin)
        ) {
          if (jhRequest.changesAllowed) {
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
          }
          return genericError.unprocessableEntity(res, 'Changes are not allowed.');
        }
        return genericError.notFound(res);
      })
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }
}

export default new JupyterHubRequestController();
