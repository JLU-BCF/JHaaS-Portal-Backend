import Verification from '../models/Verification';
import { DB_CONN } from '../config/Database';
import { DeleteResult, FindOptionsWhere } from 'typeorm';

class VerificationRepository {
  // create a new Verification
  createOne(verification: Verification): Promise<Verification> {
    return DB_CONN.getRepository(Verification).save(verification);
  }

  // find verification by id
  findById(id: string): Promise<Verification> {
    return DB_CONN.getRepository(Verification).findOneBy({ id });
  }

  // find verification by token
  findBy(
    where: FindOptionsWhere<Verification> | FindOptionsWhere<Verification>[]
  ): Promise<Verification> {
    return DB_CONN.getRepository(Verification).findOneBy(where);
  }

  // find verification by token
  findByToken(token: string): Promise<Verification> {
    return DB_CONN.getRepository(Verification).findOneBy({ token });
  }

  // find verification by target
  findByTarget(target: string): Promise<Verification> {
    return DB_CONN.getRepository(Verification).findOneBy({ target });
  }

  // find verification by token and target
  findByTokenAndTarget(token: string, target: string): Promise<Verification> {
    return DB_CONN.getRepository(Verification).findOneBy({ token, target });
  }

  // delete verification
  deleteById(id: string): Promise<DeleteResult> {
    return DB_CONN.getRepository(Verification).delete(id);
  }
}

export default new VerificationRepository();
