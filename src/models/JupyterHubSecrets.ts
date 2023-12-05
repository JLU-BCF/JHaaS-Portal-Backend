import {
  Entity,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
  BeforeInsert
} from 'typeorm';
import { JupyterHubRequest } from './JupyterHubRequest';
import { randomBytes } from 'crypto';

const byteLength = 32;
const encoding = 'base64';

@Entity()
export default class JupyterHubSecrets {
  @PrimaryColumn('uuid')
  hubId!: string;

  @OneToOne(() => JupyterHubRequest, (hub) => hub.secrets, {
    cascade: ['insert', 'remove'],
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'hubId' })
  hub: JupyterHubRequest;

  @Column()
  apiToken: string;

  @BeforeInsert()
  createJupyterHubApiSecret() {
    this.apiToken = randomBytes(byteLength).toString(encoding);
  }

  @CreateDateColumn()
  createdAt: Date;

  constructor(generateFakeToken = false) {
    if (generateFakeToken) {
      this.apiToken = randomBytes(byteLength).toString(encoding);
    }
  }
}
