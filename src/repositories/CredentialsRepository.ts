import Credentials, { AuthProvider } from '../models/Credentials';
import { DB_CONN } from '../config/Database';
import { DeleteResult } from 'typeorm';

class CredentialsRepository {
  // create new credentials
  createOne(credentials: Credentials): Promise<Credentials> {
    return DB_CONN.getRepository(Credentials).save(credentials);
  }

  // find credentials by provider and id
  findByProvider(
    authProvider: AuthProvider,
    authProviderId: string,
    relations = ['user']
  ): Promise<Credentials> {
    return DB_CONN.getRepository(Credentials).findOne({
      where: {
        authProvider,
        authProviderId
      },
      relations
    });
  }

  // update credentials
  updateOne(credentials: Credentials): Promise<Credentials> {
    return DB_CONN.getRepository(Credentials).save(credentials);
  }

  // delete credentials
  deleteByUserId(userId: string): Promise<DeleteResult> {
    return DB_CONN.getRepository(Credentials).delete(userId);
  }
}

export default new CredentialsRepository();
