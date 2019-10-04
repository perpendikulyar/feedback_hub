import { Injectable } from '@nestjs/common';
import { CreatorRepository } from './creator.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Creator } from './creator.entity';

@Injectable()
export class CreatorsService {
  constructor(
    @InjectRepository(CreatorRepository)
    private creatorRepository: CreatorRepository,
  ) {}

  async getCreatorByUserCookie(userCookie: string): Promise<Creator> {
    const creator = await this.creatorRepository.getCreatorByUserCookie(
      userCookie,
    );

    return creator;
  }

  async createCreator(userCookie: string): Promise<Creator> {
    return await this.creatorRepository.createCreator(userCookie);
  }

  async mergeCreator(userCookie: string): Promise<Creator> {
    const existCreator = await this.getCreatorByUserCookie(userCookie);

    if (!existCreator) {
      const newCreator = await this.createCreator(userCookie);
      return newCreator;
    } else {
      return existCreator;
    }
  }
}
