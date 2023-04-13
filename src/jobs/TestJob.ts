import User from '../models/User';
import UserRepository from '../repositories/UserRepository';
import { init } from './helpers/DatabaseHelper';
import { minioClient } from '../config/S3';

export function readAll(): void {
  UserRepository.findAll()
    .then((users: User[]) => {
      console.log(users);
    })
    .catch((err: unknown) => {
      console.log(err);
    });
}

export function testS3(): void {
  minioClient
    .putObject('terraform-states', 'demo.json', JSON.stringify({ hello: 'world' }))
    .then(() => console.log('yeah'))
    .catch((err) => console.log(err));
}

init().then(() => readAll());
testS3();

/**
 * npm run job ./src/jobs/TestJob.ts
 */
