import { EntityRepository, Repository } from 'typeorm';
import { Creator } from './creator.entity';
import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SystemUser } from '../auth/system-user.entity';

@EntityRepository(Creator)
export class CreatorRepository extends Repository<Creator> {
  private readonly logger = new Logger('CreatorRepository');

  async getCreatorByUserCookie(
    userCookie: string,
    systemUser: SystemUser,
  ): Promise<Creator> {
    const query = this.createQueryBuilder('creator');

    query.where(
      'creator.userCookie = :userCookie AND  creator.systemUserId = :systemUserId',
      { userCookie, systemUserId: systemUser.id },
    );

    try {
      const creator = await query.getOne();

      if (!creator) {
        this.logger.verbose('Creator not found');
      } else {
        this.logger.verbose(`Creator successfuly found`);
        return creator;
      }
    } catch (error) {
      this.logger.error(
        `Failed on find creator with cookie "${userCookie}" for system user ${
          systemUser.username
        }.`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async createCreator(
    userCookie: string,
    systemUser: SystemUser,
  ): Promise<Creator> {
    const creator = new Creator();

    creator.userCookie = userCookie;
    creator.systemUser = systemUser;

    try {
      await creator.save();

      delete creator.systemUser;
      this.logger.verbose('New creator successfuly added');
      return creator;
    } catch (error) {
      this.logger.error(
        `Failed on adding new creator with cookie "${userCookie}" for system user ${
          systemUser.username
        }.`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
