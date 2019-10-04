import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { RecordsModule } from './records/records.module';
import { CreatorsModule } from './creators/creators.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    RecordsModule,
    CreatorsModule,
    AuthModule,
  ],
})
export class AppModule {}
