import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import User from './User';

export enum JupyterHubRequestStatus {
  PENDING,
  ACCEPTED,
  REJECTED,
  DEPLOYING,
  DEPLOYED,
  DEGRADING,
  DEGRATED,
  FAILED
}

@Entity()
class JupyterHubBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  creator: User;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  description?: string;

  @Column('jsonb')
  userConf: JSON;

  @Column()
  instanceFlavour: string;

  @Column()
  instanceCount: number;

  @Column()
  containerImage: string;

  @Column()
  status: JupyterHubRequestStatus;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity()
export class JupyterHubRequest extends JupyterHubBase {
  @OneToMany(() => JupyterHubChangeRequest, (jhcr) => jhcr.origRequest)
  changeRequests: JupyterHubChangeRequest[];

  constructor() {
    super();
  }
}

@Entity()
export class JupyterHubChangeRequest extends JupyterHubBase {
  @ManyToOne(() => JupyterHubRequest)
  @JoinColumn()
  origRequest: JupyterHubRequest;

  constructor() {
    super();
  }
}
