import Tos from '../models/Tos';
import { DB_CONN } from '../config/Config';
import { DeleteResult } from 'typeorm';

class TosRepository {
  // return all tos
  findAll(): Promise<Tos[]> {
    return DB_CONN.getRepository(Tos).find();
  }

  // create a new tos
  createOne(tos: Tos): Promise<Tos> {
    return DB_CONN.getRepository(Tos).save(tos);
  }

  // find tos by id
  findById(id: string): Promise<Tos> {
    return DB_CONN.getRepository(Tos).findOneBy({ id: id });
  }

  // NO INPLACE UPDATES FOR TOS!
  // updateOne(tos: Tos): Promise<Tos> {
  //   return DB_CONN.getRepository(Tos).save(tos);
  // }

  // delete tos
  deleteById(id: string): Promise<DeleteResult> {
    return DB_CONN.getRepository(Tos).delete(id);
  }
}

export default new TosRepository();
