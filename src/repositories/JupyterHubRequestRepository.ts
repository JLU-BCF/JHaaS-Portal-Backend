import { JupyterHubRequest, JupyterHubRequestStatus } from '../models/JupyterHubRequest';
import { DB_CONN } from '../config/Config';
import { DeleteResult, MoreThan } from 'typeorm';

class JupyterHubRequestRepository {
  // return all jupyterHubRequests
  findAll(take?: number, skip?: number): Promise<JupyterHubRequest[]> {
    return DB_CONN.getRepository(JupyterHubRequest).find({
      take,
      skip
    });
  }

  // create a new jupyterHubRequest
  createOne(jupyterHubRequest: JupyterHubRequest): Promise<JupyterHubRequest> {
    return DB_CONN.getRepository(JupyterHubRequest).save(jupyterHubRequest);
  }

  // find jupyterHubRequest by id
  findById(id: string): Promise<JupyterHubRequest> {
    return DB_CONN.getRepository(JupyterHubRequest).findOneBy({ id });
  }

  // find jupyterHubRequest by slug
  findBySlug(slug: string): Promise<JupyterHubRequest> {
    return DB_CONN.getRepository(JupyterHubRequest).findOneBy({ slug });
  }

  // update a single jupyterHubRequest
  updateOne(jupyterHubRequest: JupyterHubRequest): Promise<JupyterHubRequest> {
    return DB_CONN.getRepository(JupyterHubRequest).save(jupyterHubRequest);
  }

  // delete jupyterHubRequest
  deleteById(id: string): Promise<DeleteResult> {
    return DB_CONN.getRepository(JupyterHubRequest).delete(id);
  }

  // find all open jupyterHubRequests
  findOpen(take?: number, skip?: number): Promise<JupyterHubRequest[]> {
    return DB_CONN.getRepository(JupyterHubRequest).find({
      relations: ['changeRequests'],
      where: [
        { status: JupyterHubRequestStatus.PENDING },
        { changeRequests: { status: JupyterHubRequestStatus.PENDING } }
      ],
      take,
      skip
    });
  }

  // find deployable jupyterHubRequests
  findDeployableJupyterHubRequests(take?: number, skip?: number): Promise<JupyterHubRequest[]> {
    const dueDate = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000);

    return DB_CONN.getRepository(JupyterHubRequest).find({
      where: {
        status: JupyterHubRequestStatus.ACCEPTED,
        startDate: MoreThan(dueDate)
      },
      take,
      skip
    });
  }
}

export default new JupyterHubRequestRepository();
