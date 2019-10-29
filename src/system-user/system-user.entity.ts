import * as bcrypt from 'bcryptjs';
import { Problem } from '../problems/problem.entity';
import { Author } from '../authors/author.entity';
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
  Index,
} from 'typeorm';

@Entity()
@Unique(['email'])
export class SystemUser extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  email: string;

  @Index()
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

  @Index()
  @Column({
    type: 'enum',
    enum: SystemUserRole,
    default: SystemUserRole.API_USER,
  })
  role: SystemUserRole;

  @Index()
  @Column({
    type: 'enum',
    enum: SystemUserStatus,
    default: SystemUserStatus.ACTIVE,
  })
  status: SystemUserStatus;

  @OneToMany(type => Problem, problem => problem.systemUser, { eager: true })
  problems: Problem[];

  @OneToMany(type => Author, author => author.systemUser, { eager: true })
  authors: Author[];

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}
