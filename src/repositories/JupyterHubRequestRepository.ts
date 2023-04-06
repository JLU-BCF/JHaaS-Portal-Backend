import { JupyterHubRequest, JupyterHubRequestStatus } from '../models/JupyterHubRequest';
import { DB_CONN } from '../config/Config';
import { DeleteResult, MoreThan } from 'typeorm';

class JupyterHubRequestRepository {
  // return all jupyterHubRequests
  findAll(): Promise<JupyterHubRequest[]> {
    return DB_CONN.getRepository(JupyterHubRequest).find();
  }

  // create a new jupyterHubRequest
  createOne(jupyterHubRequest: JupyterHubRequest): Promise<JupyterHubRequest> {
    return DB_CONN.getRepository(JupyterHubRequest).save(jupyterHubRequest);
  }

  // find jupyterHubRequest by id
  findById(id: string): Promise<JupyterHubRequest> {
    return DB_CONN.getRepository(JupyterHubRequest).findOneBy({ id });
  }

  // update a single jupyterHubRequest
  updateOne(jupyterHubRequest: JupyterHubRequest): Promise<JupyterHubRequest> {
    return DB_CONN.getRepository(JupyterHubRequest).save(jupyterHubRequest);
  }

  // delete jupyterHubRequest
  deleteById(id: string): Promise<DeleteResult> {
    return DB_CONN.getRepository(JupyterHubRequest).delete(id);
  }

  // find jupyterHubRequest by id
  findDeployableJupyterHubRequests(): Promise<JupyterHubRequest[]> {
    const dueDate = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000);

    return DB_CONN.getRepository(JupyterHubRequest).findBy({
      status: JupyterHubRequestStatus.ACCEPTED,
      startDate: MoreThan(dueDate)
    });
  }
}

export default new JupyterHubRequestRepository();
