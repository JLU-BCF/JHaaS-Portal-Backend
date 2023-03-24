import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export default class User {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column()
    firstName!: string;

  @Column()
    lastName!: string;

  @Column()
    email!: string;

  @CreateDateColumn()
    createdAt!: Date;

  @UpdateDateColumn()
    updatedAt!: Date;

  constructor(
    firstName?: string,
    lastName?: string,
    email?: string
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
  }
}
