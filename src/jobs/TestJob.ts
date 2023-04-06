import User from '../models/User';
import UserRepository from '../repositories/UserRepository';
import { init } from './helpers/DatabaseHelper';

export function readAll(): void {
  UserRepository.findAll()
    .then((users: User[]) => {
      console.log(users);
    })
    .catch((err: unknown) => {
      console.log(err);
    });
}

init().then(() => readAll());

/**
 * npm run job ./src/jobs/TestJob.ts
 */
