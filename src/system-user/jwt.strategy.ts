import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemUserRepository } from './system-user.repository';
import { JwtPayload } from './jwt-payload.interface';
import { SystemUser } from './system-user.entity';

import * as config from 'config';
import { SystemUserStatus } from './system-user-status.enum';

const jwtConfig = config.get('jwt');

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger('Jwt strategy');

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

    this.logger.debug(JSON.stringify(systemUser.status));
    if (!systemUser || systemUser.status === SystemUserStatus.INACTIVE) {
      this.logger.debug('JWT returnn an anautorized');
      throw new UnauthorizedException();
    }
    this.logger.debug('JWT return a user');
    return systemUser;
  }
}
