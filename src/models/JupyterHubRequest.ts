import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToOne
} from 'typeorm';
import User from './User';
import Participation from './Participation';
import {
  NB_COUNT_FACTOR,
  NB_COUNT_MIN_ADD,
  NB_GUARANTEES_FACTOR,
  NB_LIMITS_FACTOR,
  NB_MIN_CPU,
  NB_MIN_RAM,
  NS_CPU_STATIC,
  NS_LIMITS_FACTOR,
  NS_RAM_STATIC
} from '../config/K8s';
import JupyterHubSecrets from './JupyterHubSecrets';

export enum JupyterHubRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  DEPLOYING = 'DEPLOYING',
  DEPLOYED = 'DEPLOYED',
  DEGRADING = 'DEGRADING',
  DEGRATED = 'DEGRATED',
  FAILED = 'FAILED',
  REDEPLOY = 'REDEPLOY',
  DEGRADE = 'DEGRADE',
  CANCELED = 'CANCELED'
}

export interface JupyterHubRequestUserConf {
  storagePerUser: number;
  cpusPerUser: number;
  ramPerUser: number;
  userCount: number;
}

// types will be validated by middleware!
interface JupyterHubBaseRequestObj {
  creator;
  name;
  description?;
  userConf;
  containerImage;
  notebookDefaultUrl?;
  startDate;
  endDate;
}

type JupyterHubRequestObj = JupyterHubBaseRequestObj & {
  slug;
  hubUrl?;
  instanceFlavour?;
  instanceCount?;
};

const changeableProps = [
  'name',
  'description',
  'userConf',
  'containerImage',
  'notebookDefaultUrl',
  'startDate',
  'endDate'
];

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

  @Column({ nullable: true })
  notebookDefaultUrl?: string;

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
      this.notebookDefaultUrl = data.notebookDefaultUrl;
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

  @Column({ nullable: true })
  hubUrl?: string;

  @OneToOne(() => JupyterHubSecrets, (secrets) => secrets.hub, {
    cascade: ['insert']
  })
  secrets: JupyterHubSecrets;

  constructor(data?: JupyterHubRequestObj) {
    super(data);
    if (data) {
      this.slug = data.slug;
      this.hubUrl = data.hubUrl;
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

  public getCoreData() {
    return {
      creatorId: this.creator.id,
      slug: this.slug,
      name: this.name,
      description: this.description,
      startDate: this.startDate,
      endDate: this.endDate
    };
  }

  public participationAllowed() {
    return (
      this.authentikGroup &&
      [
        JupyterHubRequestStatus.ACCEPTED,
        JupyterHubRequestStatus.DEPLOYING,
        JupyterHubRequestStatus.DEPLOYED,
        JupyterHubRequestStatus.REDEPLOY
      ].includes(this.status)
    );
  }

  public getNbRamGuarantee() {
    return Math.max(this.userConf.ramPerUser * NB_GUARANTEES_FACTOR, NB_MIN_RAM);
  }

  public getNbCpuGuarantee() {
    return Math.max(this.userConf.cpusPerUser * NB_GUARANTEES_FACTOR, NB_MIN_CPU);
  }

  public getNbRamLimit() {
    return this.userConf.ramPerUser * NB_LIMITS_FACTOR;
  }

  public getNbCpuLimit() {
    return this.userConf.cpusPerUser * NB_LIMITS_FACTOR;
  }

  public getNbCountLimit() {
    return Math.max(Math.ceil(this.userConf.userCount * NB_COUNT_FACTOR), NB_COUNT_MIN_ADD);
  }

  public getNbHomeSize() {
    return this.userConf.storagePerUser;
  }

  public getNbHomeMountPath() {
    // TODO Make it dynamic
    return '/home/jovyan';
  }

  public getNsRamLimit() {
    return this.userConf.userCount * this.userConf.ramPerUser * NS_LIMITS_FACTOR + NS_RAM_STATIC;
  }

  public getNsCpuLimit() {
    return this.userConf.userCount * this.userConf.cpusPerUser * NS_LIMITS_FACTOR + NS_CPU_STATIC;
  }
}

@Entity()
export class JupyterHubChangeRequest extends JupyterHubBase {
  @ManyToOne(() => JupyterHubRequest)
  @JoinColumn()
  origRequest: JupyterHubRequest;

  // After Change Request is accepted,
  // it is merged with Orig, so no
  // un-accepting possible!
  public changesAllowed() {
    return [JupyterHubRequestStatus.PENDING, JupyterHubRequestStatus.REJECTED].includes(
      this.status
    );
  }
}
