import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export default class Tos {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text_markdown: string;

  @Column()
  text_html: string;

  @Column()
  validity_start: Date;

  @CreateDateColumn()
  createdAt: Date;

  constructor(text_markdown?: string, validity_start?: Date) {
    this.text_markdown = text_markdown;
    this.validity_start = validity_start;
  }
}
