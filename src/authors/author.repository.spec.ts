import { Test } from '@nestjs/testing';
import { AuthorRepository } from './author.repository';
import { SystemUser } from '../system-user/system-user.entity';

const mockAuthorHash = 'testHash';

const mockSystemUser = new SystemUser();
mockSystemUser.id = 1;
mockSystemUser.username = 'testName';

describe('AuthorRepository', () => {
  let authorRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthorRepository],
    }).compile();

    authorRepository = await module.get<AuthorRepository>(AuthorRepository);
  });

  describe('addAuthor', () => {
    let save;

    beforeEach(() => {
      save = jest.fn();
      authorRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('Succssefully added new author', async () => {
      save.mockResolvedValue(undefined);
      expect(
        authorRepository.addAuthor(mockAuthorHash, mockSystemUser),
      ).resolves.not.toThrow();
    });
  });
});
