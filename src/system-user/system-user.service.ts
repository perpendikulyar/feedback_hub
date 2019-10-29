import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { CreateSystemUserDto } from './dto/create-sytem-user.dto';
import { GetSystemUsersFilterDto } from './dto/get-system-users-filter.dto';
import { UpdateSystemUserDto } from './dto/update-system-user.dto';
import { JwtPayload } from './jwt-payload.interface';
import { SystemUserRole } from './system-user-role.enum';
import { SystemUser } from './system-user.entity';
import { SystemUserRepository } from './system-user.repository';

@Injectable()
export class SystemUserService {
  private readonly logger = new Logger('SystemUserService');

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
        this.logger.warn(
          `User ${systemUser.username} has no access to create system users`,
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

  async getSystemUsers(
    getSystemUsersFilterDto: GetSystemUsersFilterDto,
    systemUser: SystemUser,
  ): Promise<SystemUser[]> {
    if (systemUser.role === SystemUserRole.SUPER_ADMIN) {
      this.logger.verbose('Fetching systemUsers ...');
      return await this.systemUserRepository.getSystemUsers(
        getSystemUsersFilterDto,
      );
    } else {
      this.logger.warn(
        `SystemUser ${systemUser.username} has no access to fetch systemUsers`,
      );
      throw new NotFoundException();
    }
  }

  async getSystemUserById(
    id: number,
    systemUser: SystemUser,
  ): Promise<SystemUser> {
    if (systemUser.role === SystemUserRole.SUPER_ADMIN) {
      const found: SystemUser = await this.systemUserRepository.findOne({ id });
      if (!found) {
        this.logger.verbose(`SystemUser with id ${id} does not exist`);
        throw new NotFoundException(`SystemUser with id ${id} does not exist`);
      }
      this.logger.verbose(`SystemUser with id ${id} successfully found`);
      return found;
    } else {
      this.logger.warn(
        `SystemUser ${systemUser.username} has no access to fetch systemUsers`,
      );
      throw new NotFoundException();
    }
  }

  async updateSystemUser(
    id: number,
    updateSystemUserDto: UpdateSystemUserDto,
    systemUser: SystemUser,
  ): Promise<SystemUser> {
    const { role, status } = updateSystemUserDto;

    if (!status && !role) {
      this.logger.warn('No properties to updete are declareted');
      throw new BadRequestException('No properties to updete are declareted');
    }

    if (systemUser.role !== SystemUserRole.SUPER_ADMIN) {
      this.logger.warn(
        `User ${systemUser.username} has no access to update systemUsers`,
      );
      throw new NotFoundException();
    }

    const updatable: SystemUser = await this.getSystemUserById(id, systemUser);

    if (status) {
      updatable.status = status;
    }
    if (role) {
      updatable.role = role;
    }

    try {
      await updatable.save();
      this.logger.verbose(
        `SystemUser with ID ${id} successfully updated with new data: ${JSON.stringify(
          updateSystemUserDto,
        )} by ${systemUser.username}`,
      );
      delete updatable.problems;
      delete updatable.authors;
      return updatable;
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
