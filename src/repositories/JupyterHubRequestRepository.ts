import { JupyterHubRequest, JupyterHubRequestStatus } from '../models/JupyterHubRequest';
import { DB_CONN } from '../config/Config';
import { DeleteResult, LessThan, MoreThan } from 'typeorm';
import User from '../models/User';

class JupyterHubRequestRepository {
  // return all jupyterHubRequests
  findAll(relations?: string[], take?: number, skip?: number): Promise<[JupyterHubRequest[], number]> {
    return DB_CONN.getRepository(JupyterHubRequest).findAndCount({
      relations,
      take,
      skip
    });
  }

  // return all jupyterHubRequests
  findByCreator(
    creator: User,
    relations = ['creator'],
    take?: number,
    skip?: number
  ): Promise<[JupyterHubRequest[], number]> {
    return DB_CONN.getRepository(JupyterHubRequest).findAndCount({
      where: {
        creator: { id: creator.id }
      },
      relations,
      take,
      skip
    });
  }

  // create a new jupyterHubRequest
  createOne(jupyterHubRequest: JupyterHubRequest): Promise<JupyterHubRequest> {
    return DB_CONN.getRepository(JupyterHubRequest).save(jupyterHubRequest);
  }

  // find jupyterHubRequest by id
  findById(id: string, relations?: string[]): Promise<JupyterHubRequest> {
    return DB_CONN.getRepository(JupyterHubRequest).findOne({
      where: { id },
      relations
    });
  }

  // find jupyterHubRequest by slug
  findBySlug(slug: string, relations?: string[]): Promise<JupyterHubRequest> {
    return DB_CONN.getRepository(JupyterHubRequest).findOne({
      where: { slug },
      relations
    });
  }

  // find jupyterHubRequest by change request
  findByChangeRequest(changeRequestId: string, relations = ['changeRequests']): Promise<JupyterHubRequest> {
    return DB_CONN.getRepository(JupyterHubRequest).findOne({
      where: [{ changeRequests: { id: changeRequestId } }],
      relations
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
  findOpen(relations = ['changeRequests'], take?: number, skip?: number): Promise<[JupyterHubRequest[], number]> {
    return DB_CONN.getRepository(JupyterHubRequest).findAndCount({
      where: [
        { status: JupyterHubRequestStatus.PENDING },
        { changeRequests: { status: JupyterHubRequestStatus.PENDING } }
      ],
      relations,
      take,
      skip
    });
  }

  // find deployable jupyterHubRequests
  findDeployableJupyterHubRequests(
    relations?: string[],
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
      relations,
      take,
      skip
    });
  }

  // find degradable jupyterHubRequests
  findDegradableJupyterHubRequests(
    relations?: string[],
    take?: number,
    skip?: number
  ): Promise<[JupyterHubRequest[], number]> {
    const today = new Date();

    return DB_CONN.getRepository(JupyterHubRequest).findAndCount({
      where: {
        status: JupyterHubRequestStatus.DEPLOYED,
        endDate: LessThan(today)
      },
      relations,
      take,
      skip
    });
  }

  // find jupyterHubRequests which are in progress
  findProgressingJupyterHubRequests(
    relations?: string[],
    take?: number,
    skip?: number
  ): Promise<[JupyterHubRequest[], number]> {
    return DB_CONN.getRepository(JupyterHubRequest).findAndCount({
      where: [
        { status: JupyterHubRequestStatus.DEPLOYING },
        { status: JupyterHubRequestStatus.DEGRADING }
      ],
      relations,
      take,
      skip
    });
  }
}

export default new JupyterHubRequestRepository();
