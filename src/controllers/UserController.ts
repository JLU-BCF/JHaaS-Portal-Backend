import { Request, Response } from 'express';
import { parseUser, validationErrors } from '../helpers/BodyParserHelper';
import { getUser, isUserAdminOrSelf } from '../helpers/AuthHelper';
import User from '../models/User';
import UserRepository from '../repositories/UserRepository';
import { genericError } from '../helpers/ErrorHelper';
import Verification, { Purpose } from '../models/Verification';
import { FRONTEND_URL } from '../config/Config';
import VerificationRepository from '../repositories/VerificationRepository';
import { MailHelper } from '../mail/MailHelper';
// import { DeleteResult } from 'typeorm';

class UserController {
  /**************************
  Methods for REST Requests
  **************************/

  public readAll(req: Request, res: Response): void {
    if (!getUser(req).isAdmin) {
      return genericError.forbidden(res);
    }

    UserRepository.findAll()
      .then((users: User[]) => {
        return res.json(users);
      })
      .catch((err: unknown) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }

  public read(req: Request, res: Response): void {
    const userId = req.params.id;
    const user = getUser(req);

    if (user.id == userId) {
      res.json(user);
      return;
    } else if (user.isAdmin) {
      UserRepository.findById(userId)
        .then((userInstance: User) => {
          if (userInstance) {
            return res.json(userInstance);
          }
          return genericError.notFound(res);
        })
        .catch((err) => {
          console.log(err);
          return genericError.internalServerError(res);
        });
    } else {
      return genericError.forbidden(res);
    }
  }

  public update(req: Request, res: Response): void {
    if (validationErrors(req, res)) return;
    const userId = req.params.id;

    if (!isUserAdminOrSelf(req, userId)) {
      return genericError.forbidden(res);
    }

    UserRepository.findById(userId)
      .then((user: User) => {
        if (!user) {
          return genericError.notFound(res);
        }
        const updateUser: User = parseUser(req);

        Object.assign(
          user,
          Object.keys(updateUser)
            .filter((k) => updateUser[k] != null)
            .reduce((a, k) => ({ ...a, [k]: updateUser[k] }), {})
        );

        UserRepository.updateOne(user)
          .then((instance: User) => {
            return res.json(instance);
          })
          .catch((err: unknown) => {
            console.log(err);
            return genericError.internalServerError(res);
          });
      })
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }

  public delete(req: Request, res: Response) {
    const userId = req.params.id;
    const { verificationToken } = req.body;

    if (!isUserAdminOrSelf(req, userId)) {
      return genericError.forbidden(res);
    }

    UserRepository.findById(userId, ['credentials', 'jupyterHubRequests'])
      .then((userInstance) => {
        if (!userInstance) {
          // Should not happen.
          return genericError.internalServerError(res);
        }

        if (userInstance.jupyterHubRequests.length > 0) {
          // TODO: What to do if Courses are attached? This must be discussed with Layer 8.
          return genericError.unprocessableEntity(res, 'At the moment your account cannot be deleted if you have created courses. Please contact an administrator.');
        }

        if (verificationToken) {
          // TODO: DELETE ALL NOTEBOOKS

          // TODO: DELETE FROM AUTHENTIK

          // TODO: DELETE Model
          // UserRepository.deleteById(userId)
          //   .then((deleteResult: DeleteResult) => {
          //     if (deleteResult.affected) {
          //       return res.json('Deleted.');
          //     }
          //     return genericError.notFound(res);
          //   })
          //   .catch((err) => {
          //     console.log(err);
          //     return genericError.internalServerError(res);
          //   });

          return res.json('Deleted.');
        } else {
          // TODO: Create Verification
          const verification = new Verification(userInstance, Purpose.DELETE_USER, {
            identifier: userInstance.id,
            displayName: `${userInstance.firstName} ${userInstance.lastName}`,
            url: `${FRONTEND_URL.replace(/\/$/, '')}/user/delete`
          });

          VerificationRepository.createOne(verification)
            .then((instance) => {
              MailHelper.userDeletionVerification(instance);
              return res.json(
                'We have sent you a confirmation link by e-mail. Please check your inbox.'
              );
            })
            .catch((err) => {
              console.log(err);
              return genericError.internalServerError(res);
            });
        }

      })
      .catch((err) => {
        console.log(err);
        return genericError.internalServerError(res);
      });
  }
}

export default new UserController();
