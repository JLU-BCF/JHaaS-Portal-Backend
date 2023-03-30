import { Request, Response } from 'express';
import { parseUser } from '../helpers/BodyParserHelper';
import { checkUserId } from '../helpers/AuthHelper';
import User from '../models/User';
import UserRepository from '../repositories/UserRepository';
import { validationResult } from 'express-validator';

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
        if (!user) {
          return res.status(404).json('Not Found.');
        }
        return res.json(user);
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json('Oops - Something went wrong.');
      });
  }

  public update(req: Request, res: Response): void {
    const userId = String(req.params.id);

    if (!checkUserId(req, userId)) {
      res.status(403).end();
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json(errors.array());
      return;
    }

    UserRepository.findById(userId)
      .then((user: User) => {
        if (!user) {
          return res.status(404).json('Not Found.');
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
            return res.status(500).json(err);
          });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json('Oops - Something went wrong.');
      });
  }

  public delete(req: Request, res: Response) {
    throw new Error('Method not implemented.');
  }
}

export default new UserController();
