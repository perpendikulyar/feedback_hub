import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { EntityRepository, Repository } from 'typeorm';
import { SortOrder } from '../utility/sortOrder.enum';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { CreateSystemUserDto } from './dto/create-sytem-user.dto';
import {
  GetSystemUsersFilterDto,
  SystemUserSortBy,
} from './dto/get-system-users-filter.dto';
import { SystemUserStatus } from './system-user-status.enum';
import { SystemUser } from './system-user.entity';
import { ENTRIES_PER_PAGE } from '../utility/constants';

@EntityRepository(SystemUser)
export class SystemUserRepository extends Repository<SystemUser> {
  private readonly logger = new Logger('SystemUserRepository');

  async createSystemUser(
    createSystemUserDto: CreateSystemUserDto,
  ): Promise<void> {
    const { email, username, password, role } = createSystemUserDto;

    const systemUser = this.create();
    systemUser.email = email;
    systemUser.username = username;
    systemUser.salt = await bcrypt.genSalt();
    systemUser.password = await this.hashPassword(password, systemUser.salt);
    systemUser.lastAuthDate = new Date();
    systemUser.role = role;

    try {
      await systemUser.save();
      this.logger.verbose('User successfuly created');
    } catch (error) {
      if (error.code === '23505') {
        this.logger.verbose('Email already exist');
        throw new ConflictException('Email already exist');
      } else {
        this.logger.error(
          `Failed on creatin new user with credentials: ${JSON.stringify(
            createSystemUserDto,
          )}`,
          error.stack,
        );
        throw new InternalServerErrorException();
      }
    }
  }

  async getSystemUsers(
    getSystemUsersFilterDto: GetSystemUsersFilterDto,
  ): Promise<SystemUser[]> {
    const {
      email,
      username,
      status,
      role,
      page,
      sortBy,
      sortOrder,
    } = getSystemUsersFilterDto;

    const query = this.createQueryBuilder('systemUser');

    if (status) {
      query.andWhere('systemUser.status = :stats', { status });
    }

    if (role) {
      query.andWhere('systemUser.role = :role', { role });
    }

    if (email) {
      query.andWhere('systemUser.email like :email', { email: `%${email}%` });
    }

    if (username) {
      query.andWhere('systemUser.email like :email', {
        username: `%${username}%`,
      });
    }

    query.take((page ? page : 1) * ENTRIES_PER_PAGE);

    query.skip((page ? page : 1) * ENTRIES_PER_PAGE - ENTRIES_PER_PAGE);

    try {
      const systemUsers: SystemUser[] = await query
        .orderBy(
          sortBy ? sortBy : SystemUserSortBy.ID,
          sortOrder ? sortOrder : SortOrder.DESC,
        )
        .getMany();
      this.logger.verbose(`systemUsers successfully served`);
      return systemUsers;
    } catch (error) {
      this.logger.error(
        `Failed on fetching system users with filter: ${JSON.stringify(
          getSystemUsersFilterDto,
        )}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async validatePassword(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<string> {
    const { email, password } = authCredentialsDto;
    const systemUser = await this.findOne({ email });

    if (
      systemUser &&
      systemUser.status === SystemUserStatus.ACTIVE &&
      (await systemUser.validatePassword(password))
    ) {
      this.logger.verbose(`Successfuly sign in`);
      return systemUser.email;
    } else {
      return null;
    }
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}
