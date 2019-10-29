import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  In,
} from 'typeorm';
import { RecordStatus } from './record-status.enum';
import { Creator } from '../creators/creator.entity';
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

  @ManyToOne(type => Creator, creator => creator.records, { eager: false })
  creator: Creator;

  @Column()
  creatorId: number;

  @ManyToOne(type => SystemUser, systemUser => systemUser.records, {
    eager: false,
  })
  systemUser: SystemUser;

  @Index()
  @Column()
  systemUserId: number;

  @Column()
  creatorIp: string;

  @Column()
  creatorUserAgent: string;
}
