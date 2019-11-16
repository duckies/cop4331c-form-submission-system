import { BaseEntity, PrimaryGeneratedColumn, Entity, Column, ManyToOne } from 'typeorm';
import { Form } from '../form/form.entity';

export enum FieldType {
  TextArea = 'TextArea',
  TextInput = 'TextInput',
  Checkbox = 'Checkbox',
  Radio = 'Radio',
  Dropdown = 'Dropdown',
  FileInput = 'FileInput',
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

  // This should be changed to an enumerable
  // once the submission system is finished.
  @Column('text', { nullable: true, array: true })
  fileTypes: string[];

  @Column({ nullable: true })
  fileMaxSize: number;

  @Column()
  deleted: boolean;

  @Column()
  formId: number;

  @ManyToOne(() => Form, (form) => form.questions, { onDelete: 'CASCADE' })
  form: Form;
}
