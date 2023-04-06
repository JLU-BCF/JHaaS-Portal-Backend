import { JupyterHubChangeRequest } from '../models/JupyterHubRequest';
import { DB_CONN } from '../config/Config';
import { DeleteResult } from 'typeorm';

class JupyterHubChangeRequestRepository {
  // return all jupyterHubChangeRequests
  findAll(): Promise<JupyterHubChangeRequest[]> {
    return DB_CONN.getRepository(JupyterHubChangeRequest).find();
  }

  // create a new jupyterHubChangeRequest
  createOne(jupyterHubChangeRequest: JupyterHubChangeRequest): Promise<JupyterHubChangeRequest> {
    return DB_CONN.getRepository(JupyterHubChangeRequest).save(jupyterHubChangeRequest);
  }

  // find jupyterHubChangeRequest by id
  findById(id: string): Promise<JupyterHubChangeRequest> {
    return DB_CONN.getRepository(JupyterHubChangeRequest).findOneBy({ id });
  }

  // update a single jupyterHubChangeRequest
  updateOne(jupyterHubChangeRequest: JupyterHubChangeRequest): Promise<JupyterHubChangeRequest> {
    return DB_CONN.getRepository(JupyterHubChangeRequest).save(jupyterHubChangeRequest);
  }

  // delete jupyterHubChangeRequest
  deleteById(id: string): Promise<DeleteResult> {
    return DB_CONN.getRepository(JupyterHubChangeRequest).delete(id);
  }
}

export default new JupyterHubChangeRequestRepository();
