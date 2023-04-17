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
  PENDING   = 'PENDING',
  ACCEPTED  = 'ACCEPTED',
  REJECTED  = 'REJECTED',
  DEPLOYING = 'DEPLOYING',
  DEPLOYED  = 'DEPLOYED',
  DEGRADING = 'DEGRADING',
  DEGRATED  = 'DEGRATED',
  FAILED    = 'FAILED'
}

export type JupyterHubRequestUserConf = {
  storagePerUser: number;
  cpusPerUser: number;
  ramPerUser: number;
  userCount: number;
};

// types will be validated by middleware!
type JupyterHubBaseRequestObj = {
  creator;
  name;
  description?;
  userConf;
  containerImage;
  startDate;
  endDate;
};

type JupyterHubRequestObj = JupyterHubBaseRequestObj & { slug };

@Entity()
class JupyterHubBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  creator: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column('jsonb')
  userConf: JupyterHubRequestUserConf;

  @Column()
  containerImage: string;

  @Column({ default: JupyterHubRequestStatus.PENDING })
  status: JupyterHubRequestStatus;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(data?: JupyterHubBaseRequestObj) {
    if (data) {
      this.creator = data.creator;
      this.name = data.name;
      this.description = data.description;
      this.userConf = data.userConf;
      this.containerImage = data.containerImage;
      this.startDate = data.startDate;
      this.endDate = data.endDate;
    }

    this.status = JupyterHubRequestStatus.PENDING;
  }

  public changesAllowed() {
    const changesAllowedStates = [
      JupyterHubRequestStatus.PENDING,
      JupyterHubRequestStatus.ACCEPTED,
      JupyterHubRequestStatus.REJECTED
    ];
    return changesAllowedStates.includes(this.status);
  }
}

@Entity()
export class JupyterHubRequest extends JupyterHubBase {
  @Column({ unique: true })
  slug: string;

  @Column()
  instanceFlavour: string;

  @Column()
  instanceCount: number;

  @OneToMany(() => JupyterHubChangeRequest, (jhcr) => jhcr.origRequest, { eager: true })
  changeRequests: JupyterHubChangeRequest[];

  constructor(data?: JupyterHubRequestObj) {
    super(data);
    if (data) {
      this.slug = data.slug;
      const { instanceFlavour, instanceCount } = userConf2instanceConf(this.userConf);
      this.instanceFlavour = instanceFlavour;
      this.instanceCount = instanceCount;
    }
  }
}

@Entity()
export class JupyterHubChangeRequest extends JupyterHubBase {
  @ManyToOne(() => JupyterHubRequest)
  @JoinColumn()
  origRequest: JupyterHubRequest;

  constructor(data?: JupyterHubBaseRequestObj) {
    super(data);
  }
}

function userConf2instanceConf(userConf: JupyterHubRequestUserConf) {
  // TODO calc proper instance configuration
  console.log(userConf);
  return {
    instanceFlavour: 'default',
    instanceCount: 1
  };
}
