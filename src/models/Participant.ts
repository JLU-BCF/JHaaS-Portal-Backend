import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  PrimaryColumn
} from 'typeorm';
import Participation from './Participation';

@Entity()
export default class Participant {
  // Use Identifier from IDP as id
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Participation, (participation) => participation.participant)
  participations: Participation[];
}
