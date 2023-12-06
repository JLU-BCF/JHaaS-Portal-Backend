import { Request, Response } from 'express';
import { parseUser, validationErrors } from '../helpers/BodyParserHelper';
import { getUser, isUserAdminOrSelf } from '../helpers/AuthHelper';
import User from '../models/User';
import UserRepository from '../repositories/UserRepository';
import { genericError } from '../helpers/ErrorHelper';
import { DeleteResult } from 'typeorm';

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

    if (!isUserAdminOrSelf(req, userId)) {
      return genericError.forbidden(res);
    }

    // TODO: DELETE ALL NOTEBOOKS

    // TODO: DELETE FROM AUTHENTIK

    UserRepository.deleteById(userId)
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

export default new UserController();
