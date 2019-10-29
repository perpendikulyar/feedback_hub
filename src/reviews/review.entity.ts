import {
  Entity,
  BaseEntity,
  ManyToOne,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Check,
} from 'typeorm';
import { Author } from '../authors/author.entity';
import { SystemUser } from '../system-user/system-user.entity';

@Entity()
@Check(`"rating" >= 0 AND "rating" <= 5`)
export class Review extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Index()
  @Column({ default: 0 })
  rating: number;

  @Index()
  @Column({ nullable: true })
  category: string;

  @Index()
  @CreateDateColumn()
  creationDate: Date;

  @ManyToOne(type => Author, author => author.problems, { eager: false })
  author: Author;

  @Index()
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
