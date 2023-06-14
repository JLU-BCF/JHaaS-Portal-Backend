import { DB_CONN } from '../config/Config';
import { DeleteResult } from 'typeorm';
import Participation from '../models/Participation';

class ParticipationRepository {
  // create a new participation
  createOne(participation: Participation): Promise<Participation> {
    return DB_CONN.getRepository(Participation).save(participation);
  }

  // find participation by user_id and hub_id
  findByUserAndHub(user_id: string, hub_id: string, relations = []): Promise<Participation> {
    return DB_CONN.getRepository(Participation).findOne({
      where: {
        participantId: user_id,
        hubId: hub_id
      },
      relations
    });
  }

  // find participations by user_id
  findByUser(
    user_id: string,
    relations = ['hub'],
    take?: number,
    skip?: number
  ): Promise<[Participation[], number]> {
    return DB_CONN.getRepository(Participation).findAndCount({
      where: {
        participantId: user_id
      },
      relations,
      take,
      skip
    });
  }

  // find participations by hub_id
  findByHub(
    hub_id: string,
    relations = ['participant'],
    take?: number,
    skip?: number
  ): Promise<[Participation[], number]> {
    return DB_CONN.getRepository(Participation).findAndCount({
      where: {
        hubId: hub_id
      },
      relations,
      take,
      skip
    });
  }

  // update a single participation
  updateOne(participation: Participation): Promise<Participation> {
    return DB_CONN.getRepository(Participation).save(participation);
  }

  // delete participation
  deleteByUserAndHub(user_id: string, hub_id: string): Promise<DeleteResult> {
    return DB_CONN.getRepository(Participation).delete({
      participantId: user_id,
      hubId: hub_id
    });
  }
}

export default new ParticipationRepository();
