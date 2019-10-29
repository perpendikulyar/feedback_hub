import { EntityRepository, Repository } from 'typeorm';
import { Author } from './author.entity';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { SystemUser } from '../system-user/system-user.entity';

@EntityRepository(Author)
export class AuthorRepository extends Repository<Author> {
  private readonly logger = new Logger('AuthorRepository');

  async addAuthor(authorHash: string, systemUser: SystemUser): Promise<Author> {
    const author = this.create();
    author.authorHash = authorHash;
    author.systemUser = systemUser;

    try {
      await author.save();

      delete author.systemUser;
      this.logger.verbose('New author successfully added');
      return author;
    } catch (error) {
      this.logger.error(
        `Failed on adding new author with cookie "${authorHash}" for system user ${
          systemUser.username
        }.`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
