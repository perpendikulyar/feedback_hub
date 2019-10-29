import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { ProblemsModule } from './problems/problems.module';
import { AuthorModule } from './authors/author.module';
import { SystemUserModule } from './system-user/system-user.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ProblemsModule,
    AuthorModule,
    SystemUserModule,
    ReviewsModule,
  ],
})
export class AppModule {}
