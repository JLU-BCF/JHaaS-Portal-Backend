import Credentials, { AuthProvider } from '../models/Credentials';
import { DB_CONN } from '../config/Config';
import { DeleteResult } from 'typeorm';

class CredentialsRepository {
  // create new credentials
  createOne(credentials: Credentials): Promise<Credentials> {
    return DB_CONN.getRepository(Credentials).save(credentials);
  }

  // find credentials by userId
  findByUserId(userId: string): Promise<Credentials> {
    return DB_CONN.getRepository(Credentials).findOne({
      where: {
        userId: userId
      },
      select: ['userId', 'authProvider', 'authProviderId'],
      loadEagerRelations: false
    });
  }

  // find credentials by provider and id
  findByProvider(authProvider: AuthProvider, authProviderId: string): Promise<Credentials> {
    return DB_CONN.getRepository(Credentials).findOneBy({
      authProvider: authProvider,
      authProviderId: authProviderId
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
