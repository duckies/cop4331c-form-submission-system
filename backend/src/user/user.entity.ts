import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { Form } from '../form/form.entity'

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn()
  id: number

  @Column()
  hash: string

  @UpdateDateColumn()
  lastUpdated: Date

  // Users own many Forms.
  // Cascading allows us to include a new form within a user entity and it will
  // automatically create the relation.
  @OneToMany(() => Form, (form) => form.author, { cascade: true })
  forms: Form[]
}
