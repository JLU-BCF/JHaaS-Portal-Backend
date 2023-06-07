import { JupyterHubRequest, JupyterHubRequestStatus } from '../models/JupyterHubRequest';
import { DB_CONN } from '../config/Config';
import { DeleteResult, LessThan, MoreThan } from 'typeorm';
import User from '../models/User';

class JupyterHubRequestRepository {
  // return all jupyterHubRequests
  findAll(take?: number, skip?: number): Promise<[JupyterHubRequest[], number]> {
    return DB_CONN.getRepository(JupyterHubRequest).findAndCount({
      take,
      skip
    });
  }

  // return all jupyterHubRequests
  findByCreator(
    creator: User,
    take?: number,
    skip?: number
  ): Promise<[JupyterHubRequest[], number]> {
    return DB_CONN.getRepository(JupyterHubRequest).findAndCount({
      relations: ['creator'],
      where: {
        creator: { id: creator.id }
      },
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

  // find jupyterHubRequest by change request
  findByChangeRequest(changeRequestId: string): Promise<JupyterHubRequest> {
    return DB_CONN.getRepository(JupyterHubRequest).findOne({
      relations: ['changeRequests'],
      where: [{ changeRequests: { id: changeRequestId } }]
    });
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
  findOpen(take?: number, skip?: number): Promise<[JupyterHubRequest[], number]> {
    return DB_CONN.getRepository(JupyterHubRequest).findAndCount({
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
  findDeployableJupyterHubRequests(
    take?: number,
    skip?: number
  ): Promise<[JupyterHubRequest[], number]> {
    const dueDate = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000);
    const today = new Date();

    return DB_CONN.getRepository(JupyterHubRequest).findAndCount({
      where: {
        status: JupyterHubRequestStatus.ACCEPTED,
        startDate: MoreThan(dueDate),
        endDate: MoreThan(today)
      },
      take,
      skip
    });
  }

  // find degradable jupyterHubRequests
  findDegradableJupyterHubRequests(
    take?: number,
    skip?: number
  ): Promise<[JupyterHubRequest[], number]> {
    const today = new Date();

    return DB_CONN.getRepository(JupyterHubRequest).findAndCount({
      where: {
        status: JupyterHubRequestStatus.DEPLOYED,
        endDate: LessThan(today)
      },
      take,
      skip
    });
  }

  // find jupyterHubRequests which are in progress
  findProgressingJupyterHubRequests(
    take?: number,
    skip?: number
  ): Promise<[JupyterHubRequest[], number]> {
    return DB_CONN.getRepository(JupyterHubRequest).findAndCount({
      where: [
        { status: JupyterHubRequestStatus.DEPLOYING },
        { status: JupyterHubRequestStatus.DEGRADING }
      ],
      take,
      skip
    });
  }
}

export default new JupyterHubRequestRepository();
