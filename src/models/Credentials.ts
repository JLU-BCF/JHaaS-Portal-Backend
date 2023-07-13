import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
  JoinColumn,
  PrimaryColumn
} from 'typeorm';
import User from './User';

export enum AuthProvider {
  OIDC = 'OIDC'
}

@Entity()
@Index('authProviderIndex', ['authProvider', 'authProviderId'], { unique: true })
export default class Credentials {
  @PrimaryColumn('uuid')
  userId!: string;

  @OneToOne(() => User, (user) => user.credentials, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
    eager: true
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  authProvider: AuthProvider;

  @Column()
  authProviderId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(user: User, authProvider: AuthProvider, authProviderId: string) {
    this.user = user;
    this.authProvider = authProvider;
    this.authProviderId = authProviderId;
  }
}
