import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorRepository } from './author.repository';
import { AutorsService } from './authors.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuthorRepository])],
  controllers: [],
  providers: [AutorsService],
})
export class AuthorModule {}
