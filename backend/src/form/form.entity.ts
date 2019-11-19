import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Question } from '../question/question.entity';
import { Submission } from '../submission/submission.entity';
import { User } from '../user/user.entity';

@Entity()
export class Form extends BaseEntity {
  // This number is automatically generated and uniquely determined,
  // easily accomplishing the unique url requirement without any work.
  // However, it means users can play with the url to find other forms.
  // We may want to switch to a hash.
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  inactive: boolean;

  @OneToMany(() => Question, (question) => question.form, { eager: true })
  questions: Question[];

  // Requires Submission module.
  @OneToMany(() => Submission, (submission) => submission.form)
  submissions: Submission[];

  // Forms have one author.
  // If a user is deleted, the forms of theirs are also deleted.
  @ManyToOne(() => User, (user) => user.forms, { onDelete: 'CASCADE' })
  author: User;

  @UpdateDateColumn()
  lastUpdated: Date;
}
