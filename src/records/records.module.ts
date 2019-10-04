import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordRepository } from './record.repository';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { CreatorsModule } from '../creators/creators.module';
import { CreatorsService } from '../creators/creators.service';
import { CreatorRepository } from '../creators/creator.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecordRepository]),
    TypeOrmModule.forFeature([CreatorRepository]),
    CreatorsModule,
    AuthModule,
  ],
  controllers: [RecordsController],
  providers: [RecordsService, CreatorsService],
})
export class RecordsModule {}
