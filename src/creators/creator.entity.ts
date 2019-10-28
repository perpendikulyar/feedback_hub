import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  Index,
} from 'typeorm';
import { Record } from '../records/record.entity';
import { SystemUser } from '../auth/system-user.entity';

@Entity()
export class Creator extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  creatorHash: string;

  @OneToMany(type => Record, record => record.creator, { eager: true })
  records: Record[];

  @ManyToOne(type => SystemUser, systemUser => systemUser.creators, {
    eager: false,
  })
  systemUser: SystemUser;

  @Column()
  systemUserId: number;
}
