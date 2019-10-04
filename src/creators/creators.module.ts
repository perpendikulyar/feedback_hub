import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreatorRepository } from './creator.repository';
import { CreatorsService } from './creators.service';

@Module({
  imports: [TypeOrmModule.forFeature([CreatorRepository])],
  controllers: [],
  providers: [CreatorsService],
})
export class CreatorsModule {}
