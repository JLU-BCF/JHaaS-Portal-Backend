import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import User from './User';

export enum Purpose {
  REVOKE_PARTICIPATION = 'REVOKE_PARTICIPATION',
  DELETE_USER = 'DELETE_USER'
}

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
  expiry: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  constructor(user: User, purpose: Purpose, target: string, validityMinutes = 10) {
    this.user = user;
    this.purpose = purpose;
    this.target = target;
    const expiry = new Date();
    expiry.setTime(expiry.getTime() + (validityMinutes * 60000));
    this.expiry = expiry;
  }
}
