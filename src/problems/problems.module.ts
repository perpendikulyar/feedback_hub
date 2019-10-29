import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProblemRepository } from './problem.repository';
import { ProblemsController } from './problems.controller';
import { ProblemsService } from './problems.service';
import { AuthorModule } from '../authors/author.module';
import { AutorsService } from '../authors/authors.service';
import { AuthorRepository } from '../authors/author.repository';
import { SystemUserModule } from '../system-user/system-user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProblemRepository]),
    TypeOrmModule.forFeature([AuthorRepository]),
    AuthorModule,
    SystemUserModule,
  ],
  controllers: [ProblemsController],
  providers: [ProblemsService, AutorsService],
})
export class ProblemsModule {}
