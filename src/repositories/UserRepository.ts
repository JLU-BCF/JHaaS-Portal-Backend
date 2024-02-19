import User from '../models/User';
import { DB_CONN } from '../config/Database';
import { DeleteResult } from 'typeorm';

class UserRepository {
  // return all users
  findAll(relations?: string[]): Promise<User[]> {
    return DB_CONN.getRepository(User).find({ relations });
  }

  // create a new user
  createOne(user: User): Promise<User> {
    return DB_CONN.getRepository(User).save(user);
  }

  // find user by id
  findById(id: string, relations?: string[]): Promise<User> {
    return DB_CONN.getRepository(User).findOne({
      where: { id },
      relations
    });
  }

  // update a single user
  updateOne(user: User): Promise<User> {
    return DB_CONN.getRepository(User).save(user);
  }

  // delete user
  deleteById(id: string): Promise<DeleteResult> {
    return DB_CONN.getRepository(User).delete(id);
  }
}

export default new UserRepository();
