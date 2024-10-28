import { DataSource } from 'typeorm';
import { DB_CONN } from '../../config/Database';

export async function init(): Promise<DataSource> {
  return DB_CONN.initialize()
    .then((dataSource) => {
      return Promise.resolve(dataSource);
    })
    .catch((err) => {
      throw err;
    });
}
