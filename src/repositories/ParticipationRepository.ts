import { DB_CONN } from '../config/Config';
import { DeleteResult } from 'typeorm';
import Participation from '../models/Participation';

class ParticipationRepository {
  // create a new participation
  createOne(participation: Participation): Promise<Participation> {
    return DB_CONN.getRepository(Participation).save(participation);
  }

  // find participation by user_id and hub_id
  findByUserAndHub(user_id: string, hub_id: string): Promise<Participation> {
    return DB_CONN.getRepository(Participation).findOneBy({
      participantId: user_id,
      hubId: hub_id
    });
  }

  // find participations by user_id
  findByUser(user_id: string, take?: number, skip?: number): Promise<[Participation[], number]> {
    return DB_CONN.getRepository(Participation).findAndCount({
      relations: ['hub'],
      where: {
        participantId: user_id
      },
      take,
      skip
    });
  }

  // find participations by hub_id
  findByHub(hub_id: string, take?: number, skip?: number): Promise<[Participation[], number]> {
    return DB_CONN.getRepository(Participation).findAndCount({
      relations: ['participant'],
      where: {
        hubId: hub_id
      },
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
