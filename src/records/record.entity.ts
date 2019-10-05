import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { RecordStatus } from './record-status.enum';
import { Creator } from '../creators/creator.entity';
import { RecordType } from './record-type.enum';
import { SystemUser } from '../auth/system-user.entity';

@Entity()
export class Record extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  status: RecordStatus;

  @Column()
  type: RecordType;

  @Column('timestamptz')
  creationDate: Date;

  @Column('timestamptz')
  lastUpdatedDate: Date;

  @ManyToOne(type => Creator, creator => creator.records, { eager: false })
  creator: Creator;

  @Column()
  creatorId: number;

  @ManyToOne(type => SystemUser, systemUser => systemUser.records, {
    eager: false,
  })
  systemUser: SystemUser;

  @Column()
  systemUserId: number;
}
