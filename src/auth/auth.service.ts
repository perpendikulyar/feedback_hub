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
import { UpdateSystemUserDto } from './dto/update-system-user.dto';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

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
    const email = await this.systemUserRepository.validatePassword(
      authCredentialsDto,
    );

    if (!email) {
      this.logger.verbose('Invalid credentials');
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { email };
    const accessToken = this.jwtService.sign(payload);

    await this.systemUserRepository.update(
      { email },
      { lastAuthDate: new Date() },
    );

    this.logger.verbose(
      `Generated JWT token with payload "${JSON.stringify(payload)}"`,
    );
    return { accessToken };
  }

  async updateSystemUser(
    id: number,
    updateSystemUserDto: UpdateSystemUserDto,
    systemUser: SystemUser,
  ): Promise<SystemUser> {
    const { role, status } = updateSystemUserDto;

    if (!status && !role) {
      this.logger.verbose('No properties to updete are declareted');
      throw new BadRequestException('No properties to updete are declareted');
    }

    if (systemUser.role !== SystemUserRole.SUPER_ADMIN) {
      this.logger.verbose(
        `User ${systemUser.username} trying to update SustemUser with ID ${id}`,
      );
      throw new NotFoundException();
    }

    const updation: SystemUser = await this.systemUserRepository.findOne({
      id,
    });

    if (!updation) {
      throw new NotFoundException(`SystemUser with ID ${id} not found`);
    }

    if (status) {
      updation.status = status;
    }
    if (role) {
      updation.role = role;
    }

    try {
      await updation.save();
      this.logger.verbose(
        `SystemUser with ID ${id} successfully updated with new data: ${JSON.stringify(
          updateSystemUserDto,
        )} by ${systemUser.username}`,
      );
      return updation;
    } catch (error) {
      this.logger.error(
        `Failed on update SystemUser with ID ${id} with new data: ${JSON.stringify(
          updateSystemUserDto,
        )}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
