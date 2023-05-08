import { Request, Response } from 'express';
import { getUser } from '../helpers/AuthHelper';
import { genericError } from '../helpers/ErrorHelper';
import CredentialsRepository from '../repositories/CredentialsRepository';
import Credentials from '../models/Credentials';

class CredentialsController {
  public readAuthMethod(req: Request, res: Response): void {
    const userId = req.params.id;
    const user = getUser(req);

    if (user.id == userId || user.isAdmin) {
      CredentialsRepository.findByUserId(userId)
        .then((credentialsInstance: Credentials) => {
          if (credentialsInstance) {
            return res.json(credentialsInstance);
          }
          return genericError.unprocessableEntity(res);
        })
        .catch((err) => {
          console.log(err);
          return genericError.internalServerError(res);
        });
    } else {
      return genericError.forbidden(res);
    }
  }
}

export default new CredentialsController();
