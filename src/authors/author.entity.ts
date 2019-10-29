import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  Index,
} from 'typeorm';
import { Problem } from '../problems/problem.entity';
import { SystemUser } from '../system-user/system-user.entity';

@Entity()
export class Author extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  authorHash: string;

  @OneToMany(type => Problem, problem => problem.author, { eager: true })
  problems: Problem[];

  @ManyToOne(type => SystemUser, systemUser => systemUser.authors, {
    eager: false,
  })
  systemUser: SystemUser;

  @Column()
  systemUserId: number;
}
