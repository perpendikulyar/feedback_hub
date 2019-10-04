import { EntityRepository, Repository } from 'typeorm';
import { SystemUser } from './system-user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

@EntityRepository(SystemUser)
export class SystemUserRepository extends Repository<SystemUser> {
  private readonly logger = new Logger('SystemUserRepository');

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;

    const systemUser = new SystemUser();
    systemUser.username = username;
    systemUser.salt = await bcrypt.genSalt();
    systemUser.password = await this.hashPassword(password, systemUser.salt);

    try {
      await systemUser.save();
      this.logger.verbose('User successfuly created');
    } catch (error) {
      if (error.code === '23505') {
        this.logger.verbose('Username already exist');
        throw new ConflictException('Username already exist');
      } else {
        this.logger.error(
          `Failed on creatin new user with credentials: ${JSON.stringify(
            authCredentialsDto,
          )}`,
          error.stack,
        );
        throw new InternalServerErrorException();
      }
    }
  }

  async validatePassword(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<string> {
    const { username, password } = authCredentialsDto;
    const systemUser = await this.findOne({ username });

    if (systemUser && (await systemUser.validatePassword(password))) {
      this.logger.verbose('Successfuly sign in');
      return systemUser.username;
    } else {
      return null;
    }
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}
