import { Injectable, Logger } from '@nestjs/common';
import { CreatorRepository } from './creator.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Creator } from './creator.entity';
import { SystemUser } from '../system-user/system-user.entity';

@Injectable()
export class CreatorsService {
  private readonly logger = new Logger('CreatorsService');

  constructor(
    @InjectRepository(CreatorRepository)
    private creatorRepository: CreatorRepository,
  ) {}

  async getCreatorByCreatorHash(
    creatorHash: string,
    systemUser: SystemUser,
  ): Promise<Creator> {
    this.logger.verbose(
      `System User "${systemUser.username}" trying to found a creator`,
    );
    try {
      return await this.creatorRepository.findOne({
        where: {
          creatorHash,
          systemUserId: systemUser.id,
        },
      });
    } catch (error) {
      this.logger.error('Failed on finding creator', error.stack);
    }
  }

  async addCreator(
    creatorHash: string,
    systemUser: SystemUser,
  ): Promise<Creator> {
    this.logger.verbose(
      `System User "${systemUser.username}" trying to create new creator`,
    );
    return await this.creatorRepository.addCreator(creatorHash, systemUser);
  }

  async mergeCreator(
    creatorHash: string,
    systemUser: SystemUser,
  ): Promise<Creator> {
    this.logger.verbose(
      `System User "${systemUser.username}" runing "merge creators"`,
    );

    const existCreator = await this.getCreatorByCreatorHash(
      creatorHash,
      systemUser,
    );

    if (!existCreator) {
      return await this.addCreator(creatorHash, systemUser);
    } else {
      return existCreator;
    }
  }
}
