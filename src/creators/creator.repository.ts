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

  async createCreator(
    creatorHash: string,
    systemUser: SystemUser,
  ): Promise<Creator> {
    const creator = new Creator();

    creator.creatorHash = creatorHash;
    creator.systemUser = systemUser;

    try {
      await creator.save();

      delete creator.systemUser;
      this.logger.verbose('New creator successfuly added');
      return creator;
    } catch (error) {
      this.logger.error(
        `Failed on adding new creator with cookie "${creatorHash}" for system user ${
          systemUser.username
        }.`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
