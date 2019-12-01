import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Form } from '../form/form.entity';

@Entity()
export class Submission extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  formId: number;

  @ManyToOne(() => Form, form => form.submissions, { onDelete: 'CASCADE' })
  form: Form;

  @Column({ type: 'jsonb' })
  answers: Record<string, string | string[]>;

  @CreateDateColumn({ type: 'timestamp' })
  createdOn: Date;
}
