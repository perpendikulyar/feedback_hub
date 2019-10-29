import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { RecordsModule } from './records/records.module';
import { AuthorModule } from './authors/author.module';
import { AuthModule } from './system-user/system-user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    RecordsModule,
    AuthorModule,
    AuthModule,
  ],
})
export class AppModule {}
