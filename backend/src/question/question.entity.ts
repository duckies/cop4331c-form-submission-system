import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Form } from '../form/form.entity';

export enum FieldType {
  TextArea = 'TextArea',
  TextInput = 'TextInput',
  Checkbox = 'Checkbox',
  Radio = 'Radio',
  Dropdown = 'Dropdown',
  FileInput = 'FileInput',
}

export enum MimeTypes {
  DOC = 'application/msword',
  // We are limited to 63 bytes to store enum labels, so we truncate.
  // "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  DOCX = 'application/vnd.openxmlformats-officedocument',
  PDF = 'application/pdf',
  TXT = 'text/plain',
  ANY = 'any',
}

@Entity()
export class Question extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  label: string;

  @Column()
  order: number;

  @Column({ type: 'enum', enum: FieldType })
  type: FieldType;

  @Column()
  required: boolean;

  @Column('text', { nullable: true, array: true })
  choices: string[];

  @Column({ nullable: true })
  multiple: boolean;

  @Column({ nullable: true })
  fileMaxCount: number;

  @Column({ type: 'enum', enum: MimeTypes, nullable: true, array: true })
  mimeTypes: MimeTypes[];

  @Column()
  deleted: boolean;

  @Column()
  formId: number;

  @Column({ default: false })
  answered: boolean;

  @ManyToOne(() => Form, form => form.questions, { onDelete: 'CASCADE' })
  form: Form;

  @UpdateDateColumn()
  lastUpdated: Date;
}
