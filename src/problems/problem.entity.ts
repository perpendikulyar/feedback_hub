import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ProblemStatus } from './problem-status.enum';
import { Author } from '../authors/author.entity';
import { ProblemType } from './problem-type.enum';
import { SystemUser } from '../system-user/system-user.entity';

@Entity()
@Index(['title', 'description'])
export class Problem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Index()
  @Column({
    type: 'enum',
    enum: ProblemStatus,
    default: ProblemStatus.NEW,
  })
  status: ProblemStatus;

  @Index()
  @Column({
    type: 'enum',
    enum: ProblemType,
    default: ProblemType.NOTSET,
  })
  type: ProblemType;

  @CreateDateColumn()
  creationDate: Date;

  @UpdateDateColumn()
  lastUpdateDate: Date;

  @ManyToOne(type => Author, author => author.problems, { eager: false })
  author: Author;

  @Column()
  authorId: number;

  @ManyToOne(type => SystemUser, systemUser => systemUser.problems, {
    eager: false,
  })
  systemUser: SystemUser;

  @Index()
  @Column()
  systemUserId: number;

  @Column()
  authorIp: string;

  @Column()
  authorUserAgent: string;
}
