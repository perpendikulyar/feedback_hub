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
import { SystemUser } from '../system-user/system-user.entity';

@Entity()
export class Author extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  authorHash: string;

  @OneToMany(type => Record, record => record.author, { eager: true })
  records: Record[];

  @ManyToOne(type => SystemUser, systemUser => systemUser.authors, {
    eager: false,
  })
  systemUser: SystemUser;

  @Column()
  systemUserId: number;
}
