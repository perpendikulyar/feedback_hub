import * as bcrypt from 'bcryptjs';
import { Record } from '../records/record.entity';
import { Creator } from '../creators/creator.entity';
import { SystemUserRole } from './system-user-role.enum';
import { SystemUserStatus } from './system-user-status.enum';
import {
  Entity,
  Unique,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['username'])
export class SystemUser extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  salt: string;

  @CreateDateColumn()
  creationDate: Date;

  @Column()
  lastAuthDate: Date;

  @Column({
    type: 'enum',
    enum: SystemUserRole,
    default: SystemUserRole.API_USER,
  })
  role: SystemUserRole;

  @Column({
    type: 'enum',
    enum: SystemUserStatus,
    default: SystemUserStatus.ACTIVE,
  })
  status: SystemUserStatus;

  @OneToMany(type => Record, record => record.systemUser, { eager: true })
  records: Record[];

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }

  @OneToMany(type => Creator, creator => creator.systemUser, { eager: true })
  creators: Creator[];
}
