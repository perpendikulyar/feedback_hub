import {
  Injectable,
  UnauthorizedException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemUserRepository } from './systemUser.repository';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtPayload } from './jwt-payload.interface';
import { SystemUser } from './system-user.entity';
import { CreateSystemUserDto } from './dto/create-sytem-user.dto';
import { SystemUserRole } from './system-user-role.enum';

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
    systemUser: SystemUser,
  ): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      if (systemUser && systemUser.role === SystemUserRole.SUPER_ADMIN) {
        this.logger.verbose(
          `User ${systemUser.username} trying to create new user`,
        );
        return this.systemUserRepository.createSystemUser(createSystemUserDto);
      } else {
        this.logger.verbose(
          `Someone trying to reach creating new user service`,
        );
        throw new NotFoundException();
      }
    } else {
      return this.systemUserRepository.createSystemUser(createSystemUserDto);
    }
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

    await this.systemUserRepository.update(
      { username },
      { lastAuthDate: new Date() },
    );

    this.logger.verbose(
      `Generated JWT token with payload "${JSON.stringify(payload)}"`,
    );
    return { accessToken };
  }
}
