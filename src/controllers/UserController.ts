import { Request, Response } from 'express';
import { EntityNotFoundError } from 'typeorm';
import bodyParserHelper from '../helpers/BodyParserHelper';
import authHelper from '../helpers/AuthHelper';
import User from '../models/User';
import UserRepository from '../repositories/UserRepository';

class UserController {
  /**************************
  Methods for REST Requests
  **************************/

  public readAll(req: Request, res: Response): void {
    UserRepository.findAll()
      .then((users: User[]) => {
        return res.json(users);
      })
      .catch((err: unknown) => {
        return res.status(500).json(err);
      });
  }

  public read(req: Request, res: Response): void {
    UserRepository.findById(String(req.params.id))
      .then((user: User) => {
        return res.json(user);
      })
      .catch((err: unknown) => this.respondErrorWithStatusCode(err, res));
  }

  public update(req: Request, res: Response): void {
    const userId = String(req.params.userId);

    if (!authHelper.isAdmin(req) && !authHelper.checkUserId(req, userId)) {
      res.status(403).end();
      return;
    }

    UserRepository.findById(userId)
      .then((user: User) => {
        const updateUser: User = bodyParserHelper.parseUser(req);

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
            return res.status(500).json(err);
          });
      })
      .catch((err: unknown) => this.respondErrorWithStatusCode(err, res));
  }

  public delete(req: Request, res: Response) {
    throw new Error('Method not implemented.');
  }

  private respondErrorWithStatusCode(err: unknown, res: Response) {
    if (err instanceof EntityNotFoundError) {
      return res.status(404).json(err);
    } else {
      return res.status(500).json(err);
    }
  }
}

export default new UserController();
