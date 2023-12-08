import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import User from './User';
import { randomBytes } from 'crypto';

export enum Purpose {
  REVOKE_PARTICIPATION = 'REVOKE_PARTICIPATION',
  DELETE_USER = 'DELETE_USER'
}

export type VerificationTarget = {
  identifier: string;
  displayName: string;
  url: string;
};

const byteLength = 32;
const encoding = 'base64';

@Entity()
export default class Verification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column()
  purpose: Purpose;

  @Column()
  target: string;

  @Column()
  targetDisplayName: string;

  @Column()
  targetUrl: string;

  @Column()
  token: string;

  @Column()
  expiry: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  constructor(user: User, purpose: Purpose, target: VerificationTarget, validityMinutes = 10) {
    if (!(user && purpose && target)) {
      return;
    }

    this.token = randomBytes(byteLength).toString(encoding);
    this.user = user;
    this.purpose = purpose;
    this.target = target.identifier;
    this.targetDisplayName = target.displayName;
    this.targetUrl = target.url;
    this.targetUrl += '?verification=' + encodeURIComponent(this.token);
    const expiry = new Date();
    expiry.setTime(expiry.getTime() + validityMinutes * 60000);
    this.expiry = expiry;
  }
}
