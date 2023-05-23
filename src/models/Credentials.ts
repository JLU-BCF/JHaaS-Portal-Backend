import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
  OneToOne,
  JoinColumn,
  PrimaryColumn
} from 'typeorm';
import { hashSync } from 'bcrypt';
import User from './User';

export enum AuthProvider {
  LOCAL = 'LOCAL',
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

  // only for local authentication
  @Column({ nullable: true })
  password?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  hashPassword(): void {
    if (this.password) {
      this.password = hashSync(this.password, 10);
    }
  }

  constructor(user: User, authProvider: AuthProvider, authProviderId: string, password?: string) {
    this.user = user;
    this.authProvider = authProvider;
    this.authProviderId = authProviderId;
    this.password = password ?? null;
  }
}
