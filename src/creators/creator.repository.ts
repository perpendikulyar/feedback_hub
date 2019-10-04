import { EntityRepository, Repository } from 'typeorm';
import { Creator } from './creator.entity';
import { InternalServerErrorException } from '@nestjs/common';

@EntityRepository(Creator)
export class CreatorRepository extends Repository<Creator> {
  async getCreatorByUserCookie(userCookie: string): Promise<Creator> {
    const query = this.createQueryBuilder('creator');

    query.where('creator.userCookie = :userCookie', { userCookie });

    try {
      const creator: Creator = await query.getOne();

      return creator;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async createCreator(userCookie: string): Promise<Creator> {
    const creator = new Creator();

    creator.userCookie = userCookie;

    try {
      await creator.save();

      return creator;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
