import User from '../models/User';
import UserRepository from '../repositories/UserRepository';
import { init } from './helpers/DatabaseHelper';
import { mailTransporter } from '../config/Mail';

export function readAll(): void {
  UserRepository.findAll()
    .then((users: User[]) => {
      users.forEach((user) => {
        mailTransporter
          .sendMail({
            from: '"Demo Dispatcher" <demo-dispatcher@test.local>',
            to: user.email,
            subject: 'Demo E-Mail',
            text: `Hey, this is you: ${JSON.stringify(user)}`,
            html: `<p>Hey, this is you:</p><pre>${JSON.stringify(user)}</pre>`
          })
          .then(() => console.log('Mail sent.'))
          .catch((err) => console.log(err));
      });
    })
    .catch((err: unknown) => {
      console.log(err);
    });
}

init().then(() => readAll());

/**
 * npm run job ./src/jobs/TestMailJob.ts
 */
