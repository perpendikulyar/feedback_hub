import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewRepository } from './review.repository';
import { AuthorRepository } from '../authors/author.repository';
import { AuthorModule } from '../authors/author.module';
import { SystemUserModule } from '../system-user/system-user.module';
import { AutorsService } from '../authors/authors.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewRepository, AuthorRepository]),
    AuthorModule,
    SystemUserModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, AutorsService],
})
export class ReviewsModule {}
