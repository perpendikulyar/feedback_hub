import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordRepository } from './record.repository';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { AuthorModule } from '../authors/author.module';
import { AutorsService } from '../authors/authors.service';
import { AuthorRepository } from '../authors/author.repository';
import { AuthModule } from '../system-user/system-user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecordRepository]),
    TypeOrmModule.forFeature([AuthorRepository]),
    AuthorModule,
    AuthModule,
  ],
  controllers: [RecordsController],
  providers: [RecordsService, AutorsService],
})
export class RecordsModule {}
