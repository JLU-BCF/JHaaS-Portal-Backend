import Tos from '../models/Tos';
import { DB_CONN } from '../config/Database';
import { And, DeleteResult, IsNull, LessThanOrEqual, MoreThan, Not } from 'typeorm';

class TosRepository {
  // return all tos
  findAll(): Promise<Tos[]> {
    return DB_CONN.getRepository(Tos).find();
  }

  // return published tos
  findPublished(): Promise<Tos[]> {
    return DB_CONN.getRepository(Tos).find({
      where: { published_date: Not(IsNull()) }
    });
  }

  // return pending tos
  findPending(): Promise<Tos[]> {
    return DB_CONN.getRepository(Tos).find({
      where: {
        draft: false,
        published_date: IsNull()
      }
    });
  }

  // return latest tos
  findLatest(): Promise<Tos> {
    return DB_CONN.getRepository(Tos).findOne({
      where: {
        published_date: And(Not(IsNull()), LessThanOrEqual(new Date()))
      },
      order: {
        published_date: 'DESC'
      }
    });
  }

  // return next tos
  findNext(): Promise<Tos> {
    return DB_CONN.getRepository(Tos).findOne({
      where: {
        published_date: And(Not(IsNull()), MoreThan(new Date()))
      },
      order: {
        published_date: 'ASC'
      }
    });
  }

  // create a new tos
  createOne(tos: Tos): Promise<Tos> {
    return DB_CONN.getRepository(Tos).save(tos);
  }

  // find tos by id
  findById(id: string): Promise<Tos> {
    return DB_CONN.getRepository(Tos).findOneBy({ id: id });
  }

  // find tos by id
  findPublishedById(id: string): Promise<Tos> {
    return DB_CONN.getRepository(Tos).findOne({
      where: {
        id: id,
        published_date: Not(IsNull())
      }
    });
  }

  // Update only allowed for drafts!
  updateOne(tos: Tos): Promise<Tos> {
    return DB_CONN.getRepository(Tos).save(tos);
  }

  // Delete tos only allowed for drafts!
  deleteById(id: string): Promise<DeleteResult> {
    return DB_CONN.getRepository(Tos).delete(id);
  }
}

export default new TosRepository();
