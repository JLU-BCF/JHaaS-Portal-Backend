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
import Participation from './Participation';

export enum JupyterHubRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  DEPLOYING = 'DEPLOYING',
  DEPLOYED = 'DEPLOYED',
  DEGRADING = 'DEGRADING',
  DEGRATED = 'DEGRATED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED'
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

type JupyterHubRequestObj = JupyterHubBaseRequestObj & {
  slug;
  instanceFlavour?;
  instanceCount?;
};

const changeableProps = [
  'name',
  'description',
  'userConf',
  'containerImage',
  'startDate',
  'endDate'
];

@Entity()
class JupyterHubBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
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
    return [
      JupyterHubRequestStatus.PENDING,
      JupyterHubRequestStatus.ACCEPTED,
      JupyterHubRequestStatus.REJECTED
    ].includes(this.status);
  }

  public userAllowed(user: User) {
    return this.creator.id == user.id || user.isAdmin;
  }

  public userAndChangesAllowed(user: User) {
    return this.userAllowed(user) && this.changesAllowed();
  }
}

@Entity()
export class JupyterHubRequest extends JupyterHubBase {
  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  authentikGroup: string;

  @Column()
  instanceFlavour: string;

  @Column()
  instanceCount: number;

  @OneToMany(() => JupyterHubChangeRequest, (jhcr) => jhcr.origRequest, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
    eager: true
  })
  changeRequests: JupyterHubChangeRequest[];

  @OneToMany(() => Participation, (participation) => participation.hub)
  participations: Participation[];

  constructor(data?: JupyterHubRequestObj) {
    super(data);
    if (data) {
      this.slug = data.slug;
      if (data.instanceFlavour && data.instanceCount) {
        this.instanceFlavour = data.instanceFlavour;
        this.instanceCount = data.instanceCount;
      } else {
        this.userConf2instanceConf();
      }
    }
  }

  private userConf2instanceConf() {
    // TODO calc proper instance configuration
    this.instanceFlavour = 'default';
    this.instanceCount = 1;
  }

  public cancelPendingChangeRequests() {
    for (const changeReq of this.changeRequests) {
      if (changeReq.status == JupyterHubRequestStatus.PENDING) {
        changeReq.status = JupyterHubRequestStatus.CANCELED;
      }
    }
  }

  public setChangeRequestStatus(changeRequestId: string, status: JupyterHubRequestStatus) {
    for (const changeReq of this.changeRequests) {
      if (changeReq.id == changeRequestId) {
        changeReq.status = status;
      }
    }
  }

  public applyChangeRequest(changeRequestId: string) {
    for (const changeReq of this.changeRequests) {
      if (changeReq.id == changeRequestId) {
        changeReq.status = JupyterHubRequestStatus.ACCEPTED;
        for (const prop of changeableProps) {
          this[prop] = changeReq[prop];
        }
        this.userConf2instanceConf();
        this.status = JupyterHubRequestStatus.ACCEPTED;
      }
    }
  }

  public getChangeRequestById(changeRequestId: string) {
    for (const changeRequest of this.changeRequests) {
      if (changeRequest.id == changeRequestId) {
        return changeRequest;
      }
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

  // After Change Request is accepted,
  // it is merged with Orig, so no
  // un-accepting possible!
  public changesAllowed() {
    return [JupyterHubRequestStatus.PENDING, JupyterHubRequestStatus.REJECTED].includes(
      this.status
    );
  }
}
