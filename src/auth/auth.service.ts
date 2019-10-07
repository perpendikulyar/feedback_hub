import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemUserRepository } from './systemUser.repository';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtPayload } from './jwt-payload.interface';
import { SystemUser } from './system-user.entity';
import { CreateSystemUserDto } from './dto/create-sytem-user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(SystemUserRepository)
    private systemUserRepository: SystemUserRepository,
    private jwtService: JwtService,
  ) {}

  async createSystemUser(
    createSystemUserDto: CreateSystemUserDto,
  ): Promise<void> {
    return this.systemUserRepository.createSystemUser(createSystemUserDto);
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const username = await this.systemUserRepository.validatePassword(
      authCredentialsDto,
    );

    if (!username) {
      this.logger.verbose('Invalid credentials');
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { username };
    const accessToken = this.jwtService.sign(payload);

    await this.systemUserRepository.update(username, {
      lastAuthDate: new Date(),
    });

    this.logger.debug(
      `Generated JWT token with payload "${JSON.stringify(payload)}"`,
    );
    return { accessToken };
  }
}
