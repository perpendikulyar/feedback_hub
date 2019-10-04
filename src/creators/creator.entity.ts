import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Record } from '../records/record.entity';

@Entity()
export class Creator extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userCookie: string;

  @OneToMany(type => Record, record => record.creator, { eager: true })
  records: Record[];
}
