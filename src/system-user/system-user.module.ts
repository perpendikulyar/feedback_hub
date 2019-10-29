import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SystemUserController } from './system-user.controller';
import { SystemUserService } from './system-user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './jwt.strategy';
import * as config from 'config';
import { SystemUserRepository } from './system-user.repository';

const jwtConfig = config.get('jwt');

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || jwtConfig.secret,
      signOptions: {
        expiresIn: jwtConfig.expiresIn,
      },
    }),
    TypeOrmModule.forFeature([SystemUserRepository]),
  ],
  controllers: [SystemUserController],
  providers: [SystemUserService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
