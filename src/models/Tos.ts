import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { marked } from 'marked';

interface ITos {
  text_markdown: string,
  text_html?: string,
  draft: boolean,
  published_date?: Date,
  validity_start: Date,
}

@Entity()
export default class Tos implements ITos {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text_markdown: string;

  @Column()
  text_html: string;

  @Column({ default: true })
  draft: boolean;

  @Column({ nullable: true })
  published_date?: Date;

  @Column()
  validity_start: Date;

  @CreateDateColumn()
  createdAt: Date;

  constructor(tos?: ITos) {
    if (tos) {
      this.text_markdown = tos.text_markdown;
      this.text_html = tos.text_html || marked(tos.text_markdown);
      this.draft = tos.draft;
      this.published_date = tos.published_date;
      this.validity_start = tos.validity_start;
    }
  }
}
