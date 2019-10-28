import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemUserRepository } from './system-user.repository';
import { JwtPayload } from './jwt-payload.interface';
import { SystemUser } from './system-user.entity';

import * as config from 'config';

const jwtConfig = config.get('jwt');

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(SystemUserRepository)
    private systemUserRepository: SystemUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || jwtConfig.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<SystemUser> {
    const { email } = payload;
    const systemUser = await this.systemUserRepository.findOne({ email });

    if (!systemUser) {
      throw new UnauthorizedException();
    }

    return systemUser;
  }
}
