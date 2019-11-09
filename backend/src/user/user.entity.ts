import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, BaseEntity } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hash: string;

  @UpdateDateColumn()
  lastUpdated: Date;
}
