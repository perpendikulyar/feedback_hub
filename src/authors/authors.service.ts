import { Injectable, Logger } from '@nestjs/common';
import { AuthorRepository } from './author.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Author } from './author.entity';
import { SystemUser } from '../system-user/system-user.entity';

@Injectable()
export class AutorsService {
  private readonly logger = new Logger('AutorsService');

  constructor(
    @InjectRepository(AuthorRepository)
    private authorRepository: AuthorRepository,
  ) {}

  async getAuthorByAuthorHash(
    authorHash: string,
    systemUser: SystemUser,
  ): Promise<Author> {
    this.logger.verbose(
      `System User "${systemUser.username}" trying to found an author`,
    );
    try {
      return await this.authorRepository.findOne({
        where: {
          authorHash,
          systemUserId: systemUser.id,
        },
      });
    } catch (error) {
      this.logger.error('Failed on finding author', error.stack);
    }
  }

  async addAuthor(authorHash: string, systemUser: SystemUser): Promise<Author> {
    this.logger.verbose(
      `System User "${systemUser.username}" trying to create new author`,
    );
    return await this.authorRepository.addAuthor(authorHash, systemUser);
  }

  async mergeAuthor(
    authorHash: string,
    systemUser: SystemUser,
  ): Promise<Author> {
    this.logger.verbose(
      `System User "${systemUser.username}" runing "merge authors"`,
    );

    const existAuthor = await this.getAuthorByAuthorHash(
      authorHash,
      systemUser,
    );

    if (!existAuthor) {
      return await this.addAuthor(authorHash, systemUser);
    } else {
      return existAuthor;
    }
  }
}
