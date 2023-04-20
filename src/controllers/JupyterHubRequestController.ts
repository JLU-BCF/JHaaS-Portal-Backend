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
import { DeleteResult } from 'typeorm';

function cancelPendingChangeRequests(jhRequest: JupyterHubRequest) {
  for (const changeReq of jhRequest.changeRequests) {
    if (changeReq.status == JupyterHubRequestStatus.PENDING) {
      changeReq.status = JupyterHubRequestStatus.CANCELED;
    }
  }
}

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

  public listOpen(req: Request, res: Response): void {
    if (!getUser(req).isAdmin) {
      return genericError.forbidden(res);
    }

    JupyterHubRequestRepository.findOpen()
      .then((jhRequests: JupyterHubRequest[]) => {
        return res.json(jhRequests);
      })
      .catch((err: unknown) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }

  public list(req: Request, res: Response): void {
    const user = getUser(req);
    user.jupyterHubRequests
      .then((jhRequests) => {
        res.json(jhRequests);
      })
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });

    // JupyterHubRequestRepository.findByCreator(user)
    //   .then((jhRequests: JupyterHubRequest[]) => {
    //     return res.json(jhRequests);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     return genericError.internalServerError(res);
    //   });
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

  public readBySlug(req: Request, res: Response): void {
    const jhRequestSlug = req.params.slug;
    const user = getUser(req);

    JupyterHubRequestRepository.findBySlug(jhRequestSlug)
      .then((jhRequest: JupyterHubRequest) => {
        console.log(jhRequest);
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
    const jhRequestId = req.body.id;
    const user = getUser(req);

    // TODO: lock database row to prevent parallelism
    JupyterHubRequestRepository.findById(jhRequestId)
      .then((jhRequest: JupyterHubRequest) => {
        if (
          jhRequest &&
          jhRequest.changesAllowed() &&
          (jhRequest.creator.id == user.id || user.isAdmin)
        ) {
          const jhChangeRequest = parseJupyterHubChangeRequest(req);
          cancelPendingChangeRequests(jhRequest);
          jhRequest.changeRequests.push(jhChangeRequest);
          return JupyterHubRequestRepository.updateOne(jhRequest)
            .then((instance: JupyterHubRequest) => {
              return res.json(instance);
            })
            .catch((err) => {
              console.log(err);
              return genericError.internalServerError(res);
            });
        }
        return genericError.unprocessableEntity(res);
      })
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }

  public changeCancel(req: Request, res: Response): void {
    const jhRequestId = req.params.id;
    const user = getUser(req);

    JupyterHubRequestRepository.findById(jhRequestId)
      .then((jhRequest: JupyterHubRequest) => {
        if (
          jhRequest &&
          jhRequest.changesAllowed() &&
          (jhRequest.creator.id == user.id || user.isAdmin)
        ) {
          jhRequest.status = JupyterHubRequestStatus.CANCELED;
          cancelPendingChangeRequests(jhRequest);
          return JupyterHubRequestRepository.updateOne(jhRequest)
            .then((instance: JupyterHubRequest) => {
              return res.json(instance);
            })
            .catch((err) => {
              console.log(err);
              return genericError.internalServerError(res);
            });
        }
        return genericError.unprocessableEntity(res);
      })
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }

  public cancel(req: Request, res: Response): void {
    const jhRequestId = req.params.id;
    const user = getUser(req);

    JupyterHubRequestRepository.findById(jhRequestId)
      .then((jhRequest: JupyterHubRequest) => {
        if (
          jhRequest &&
          jhRequest.changesAllowed() &&
          (jhRequest.creator.id == user.id || user.isAdmin)
        ) {
          jhRequest.status = JupyterHubRequestStatus.CANCELED;
          cancelPendingChangeRequests(jhRequest);
          return JupyterHubRequestRepository.updateOne(jhRequest)
            .then((instance: JupyterHubRequest) => {
              return res.json(instance);
            })
            .catch((err) => {
              console.log(err);
              return genericError.internalServerError(res);
            });
        }
        return genericError.unprocessableEntity(res);
      })
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }

  public changeAccept(req: Request, res: Response): void {
    const jhRequestId = req.params.id;
    if (!getUser(req).isAdmin) {
      return genericError.forbidden(res);
    }

    JupyterHubRequestRepository.findById(jhRequestId)
      .then((jhRequest: JupyterHubRequest) => {
        if (jhRequest && jhRequest.changesAllowed()) {
          jhRequest.status = JupyterHubRequestStatus.ACCEPTED;
          return JupyterHubRequestRepository.updateOne(jhRequest)
            .then((instance: JupyterHubRequest) => {
              return res.json(instance);
            })
            .catch((err) => {
              console.log(err);
              return genericError.internalServerError(res);
            });
        }
        return genericError.unprocessableEntity(res);
      })
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }

  public accept(req: Request, res: Response): void {
    const jhRequestId = req.params.id;
    if (!getUser(req).isAdmin) {
      return genericError.forbidden(res);
    }

    JupyterHubRequestRepository.findById(jhRequestId)
      .then((jhRequest: JupyterHubRequest) => {
        if (jhRequest && jhRequest.changesAllowed()) {
          jhRequest.status = JupyterHubRequestStatus.ACCEPTED;
          return JupyterHubRequestRepository.updateOne(jhRequest)
            .then((instance: JupyterHubRequest) => {
              return res.json(instance);
            })
            .catch((err) => {
              console.log(err);
              return genericError.internalServerError(res);
            });
        }
        return genericError.unprocessableEntity(res);
      })
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }

  public changeReject(req: Request, res: Response): void {
    const jhRequestId = req.params.id;
    if (!getUser(req).isAdmin) {
      return genericError.forbidden(res);
    }

    JupyterHubRequestRepository.findById(jhRequestId)
      .then((jhRequest: JupyterHubRequest) => {
        if (jhRequest && jhRequest.changesAllowed()) {
          jhRequest.status = JupyterHubRequestStatus.REJECTED;
          return JupyterHubRequestRepository.updateOne(jhRequest)
            .then((instance: JupyterHubRequest) => {
              return res.json(instance);
            })
            .catch((err) => {
              console.log(err);
              return genericError.internalServerError(res);
            });
        }
        return genericError.unprocessableEntity(res);
      })
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }

  public reject(req: Request, res: Response): void {
    const jhRequestId = req.params.id;
    if (!getUser(req).isAdmin) {
      return genericError.forbidden(res);
    }

    JupyterHubRequestRepository.findById(jhRequestId)
      .then((jhRequest: JupyterHubRequest) => {
        if (jhRequest && jhRequest.changesAllowed()) {
          jhRequest.status = JupyterHubRequestStatus.REJECTED;
          return JupyterHubRequestRepository.updateOne(jhRequest)
            .then((instance: JupyterHubRequest) => {
              return res.json(instance);
            })
            .catch((err) => {
              console.log(err);
              return genericError.internalServerError(res);
            });
        }
        return genericError.unprocessableEntity(res);
      })
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
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
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }
}

export default new JupyterHubRequestController();
