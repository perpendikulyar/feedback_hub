import { Test } from '@nestjs/testing';
import { AutorsService } from './authors.service';
import { AuthorRepository } from './author.repository';
import { SystemUser } from '../system-user/system-user.entity';

const mockSystemUser = new SystemUser();

mockSystemUser.id = 1;
mockSystemUser.username = 'Test user';

const mockAuthorRepository = () => ({
  addAuthor: jest.fn(),
  findOne: jest.fn(),
});

const mockAuthor = { authorHash: 'testHash' };

const mockAuthorHash = 'testHash';

describe('AuthorService', () => {
  let authorsService: AutorsService;
  let authorRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AutorsService,
        { provide: AuthorRepository, useFactory: mockAuthorRepository },
      ],
    }).compile();

    authorsService = await module.get<AutorsService>(AutorsService);
    authorRepository = await module.get<AuthorRepository>(AuthorRepository);
  });

  describe('getAuthorByauthorHash', () => {
    it('Get author by Author Hash from author repository', async () => {
      authorRepository.findOne.mockResolvedValue(mockAuthor);

      expect(authorRepository.findOne).not.toHaveBeenCalled();

      const result = await authorsService.getAuthorByAuthorHash(
        mockAuthorHash,
        mockSystemUser,
      );
      expect(authorRepository.findOne).toHaveBeenCalledWith({
        where: { authorHash: 'testHash', systemUserId: mockSystemUser.id },
      });
      expect(result).toEqual(mockAuthor);
    });
  });

  describe('addAuthor', () => {
    it('call authorRepository.addAuthor() and return new author', async () => {
      authorRepository.addAuthor.mockResolvedValue('newAuthor');

      expect(authorRepository.addAuthor).not.toHaveBeenCalled();
      const result = await authorsService.addAuthor(
        mockAuthorHash,
        mockSystemUser,
      );
      expect(authorRepository.addAuthor).toHaveBeenCalled();
      expect(result).toEqual('newAuthor');
    });
  });

  describe('mergeAuthor', () => {
    it('Try to run authorService.getAuthorByAuthorHash', async () => {
      spyOn(authorsService, 'getAuthorByAuthorHash').and.returnValue(
        Promise.resolve(mockAuthor),
      );
      spyOn(authorsService, 'addAuthor');

      const result = await authorsService.mergeAuthor(
        mockAuthorHash,
        mockSystemUser,
      );
      expect(authorsService.getAuthorByAuthorHash).toHaveBeenCalledWith(
        mockAuthorHash,
        mockSystemUser,
      );
      expect(authorsService.addAuthor).not.toHaveBeenCalled();
      expect(result).toEqual(mockAuthor);
    });

    it('should call `addAuthor`', async () => {
      spyOn(authorsService, 'getAuthorByAuthorHash').and.returnValue(
        Promise.resolve(undefined),
      );
      spyOn(authorsService, 'addAuthor').and.returnValue(
        Promise.resolve(mockAuthor),
      );

      const result = await authorsService.mergeAuthor(
        mockAuthorHash,
        mockSystemUser,
      );

      expect(authorsService.addAuthor).toHaveBeenCalledWith(
        mockAuthorHash,
        mockSystemUser,
      );
      expect(result).toEqual(mockAuthor);
    });
  });
});
