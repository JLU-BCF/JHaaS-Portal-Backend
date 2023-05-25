import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne
} from 'typeorm';
import { JupyterHubRequest } from './JupyterHubRequest';
import Credentials from './Credentials';
import Participation from './Participation';

@Entity()
export default class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Credentials, (credentials) => credentials.user)
  credentials: Promise<Credentials>;

  @OneToMany(() => JupyterHubRequest, (jhr) => jhr.creator)
  jupyterHubRequests: Promise<JupyterHubRequest[]>;

  @OneToMany(() => Participation, (participation) => participation.participant)
  participations: Participation[];

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: false })
  isLead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(firstName?: string, lastName?: string, email?: string) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
  }

  // This is not stored in DB and is only
  // a temporary value for session serialization
  // and deserialization
  sessionLogout?: string;
}
