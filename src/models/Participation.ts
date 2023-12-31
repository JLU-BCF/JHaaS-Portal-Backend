import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { JupyterHubRequest } from './JupyterHubRequest';
import Participant from './User';

export enum ParticipationStatus {
  PENDING = 'PENDING',
  ACEPPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

@Entity()
export default class Participation {
  @PrimaryColumn('uuid')
  hubId: string;

  @PrimaryColumn('uuid')
  participantId: string;

  @Column()
  status: ParticipationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => JupyterHubRequest, (jhr) => jhr.participations, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'hubId' })
  hub: JupyterHubRequest;

  @ManyToOne(() => Participant, (participant) => participant.participations, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'participantId' })
  participant: Participant;

  constructor(participantId: string, hubId: string, status = ParticipationStatus.PENDING) {
    this.participantId = participantId;
    this.hubId = hubId;
    this.status = status;
  }
}
