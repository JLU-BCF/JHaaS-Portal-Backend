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
import Verification from './Verification';

@Entity()
export default class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  externalId: string | null;

  @OneToOne(() => Credentials, (credentials) => credentials.user)
  credentials: Promise<Credentials>;

  @OneToMany(() => JupyterHubRequest, (jhr) => jhr.creator)
  jupyterHubRequests: Promise<JupyterHubRequest[]>;

  @OneToMany(() => Participation, (participation) => participation.participant)
  participations: Participation[];

  @OneToMany(() => Verification, (verification) => verification.user)
  verifications: Verification[];

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

  constructor(
    firstName?: string,
    lastName?: string,
    email?: string,
    isAdmin = false,
    isLead = false,
    externalId = null
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.isAdmin = isAdmin;
    this.isLead = isLead;
    this.externalId = externalId;
  }

  sync(toSync: {
    isAdmin: boolean;
    isLead: boolean;
    firstName: string;
    lastName: string;
    email: string;
    externalId: string | null;
  }) {
    let changed = false;
    const attrs = ['isAdmin', 'isLead', 'firstName', 'lastName', 'email', 'externalId'];

    for (const attr of attrs) {
      if (this[attr] !== toSync[attr]) {
        this[attr] = toSync[attr];
        changed = true;
      }
    }

    return changed;
  }

  authentikId() {
    return this.credentials
      .then((creds) => creds.authProviderId)
      .catch((err) => {
        console.log(err);
        return null;
      });
  }

  // This is not stored in DB and is only
  // a temporary value for session serialization
  // and deserialization
  sessionLogout?: string;
}
