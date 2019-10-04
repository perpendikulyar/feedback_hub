import { Injectable, Logger } from '@nestjs/common';
import { CreatorRepository } from './creator.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Creator } from './creator.entity';
import { SystemUser } from '../auth/system-user.entity';

@Injectable()
export class CreatorsService {
  private readonly logger = new Logger('CreatorsService');

  constructor(
    @InjectRepository(CreatorRepository)
    private creatorRepository: CreatorRepository,
  ) {}

  async getCreatorByUserCookie(
    userCookie: string,
    systemUser: SystemUser,
  ): Promise<Creator> {
    this.logger.verbose(
      `System User "${systemUser.username}" trying to found a creator`,
    );
    return await this.creatorRepository.getCreatorByUserCookie(
      userCookie,
      systemUser,
    );
  }

  async createCreator(
    userCookie: string,
    systemUser: SystemUser,
  ): Promise<Creator> {
    this.logger.verbose(
      `System User "${systemUser.username}" trying to create new creator`,
    );
    return await this.creatorRepository.createCreator(userCookie, systemUser);
  }

  async mergeCreator(
    userCookie: string,
    systemUser: SystemUser,
  ): Promise<Creator> {
    this.logger.verbose(
      `System User "${systemUser.username}" runing "merge creators"`,
    );
    const existCreator = await this.getCreatorByUserCookie(
      userCookie,
      systemUser,
    );

    if (!existCreator) {
      const newCreator = await this.createCreator(userCookie, systemUser);
      return newCreator;
    } else {
      return existCreator;
    }
  }
}
