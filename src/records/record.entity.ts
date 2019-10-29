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
import { RecordStatus } from './record-status.enum';
import { Author } from '../authors/author.entity';
import { RecordType } from './record-type.enum';
import { SystemUser } from '../system-user/system-user.entity';

@Entity()
@Index(['title', 'description'])
export class Record extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Index()
  @Column({
    type: 'enum',
    enum: RecordStatus,
    default: RecordStatus.NEW,
  })
  status: RecordStatus;

  @Index()
  @Column({
    type: 'enum',
    enum: RecordType,
    default: RecordType.NOTSET,
  })
  type: RecordType;

  @CreateDateColumn()
  creationDate: Date;

  @UpdateDateColumn()
  lastUpdateDate: Date;

  @ManyToOne(type => Author, author => author.records, { eager: false })
  author: Author;

  @Column()
  authorId: number;

  @ManyToOne(type => SystemUser, systemUser => systemUser.records, {
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
