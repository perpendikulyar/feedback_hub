import { Test } from '@nestjs/testing';
import { CreatorsService } from './creators.service';
import { CreatorRepository } from './creator.repository';
import { SystemUser } from '../auth/system-user.entity';

const mockSystemUser = new SystemUser();

mockSystemUser.id = 1;
mockSystemUser.username = 'Test user';

const mockCreatorRepository = () => ({
  addCreator: jest.fn(),
  findOne: jest.fn(),
});

describe('CreatorsService', () => {
  let creatorsService: CreatorsService;
  let creatorRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CreatorsService,
        { provide: CreatorRepository, useFactory: mockCreatorRepository },
      ],
    }).compile();

    creatorsService = await module.get<CreatorsService>(CreatorsService);
    creatorRepository = await module.get<CreatorRepository>(CreatorRepository);
  });

  describe('getCreatorByCreatorHash', () => {
    it('Get creator by Creator Hash from creator repository', async () => {
      const mockCreator = { creatorHash: 'testHash' };
      creatorRepository.findOne.mockResolvedValue(mockCreator);

      expect(creatorRepository.findOne).not.toHaveBeenCalled();

      const result = await creatorsService.getCreatorByCreatorHash(
        'testHash',
        mockSystemUser,
      );
      expect(creatorRepository.findOne).toHaveBeenCalledWith({
        where: { creatorHash: 'testHash', systemUserId: mockSystemUser.id },
      });
      expect(result).toEqual(mockCreator);
    });
  });

  describe('addCreator', () => {
    it('call creatorRepository.addCreator() and return new creator', async () => {
      creatorRepository.addCreator.mockResolvedValue('newCreator');

      expect(creatorRepository.addCreator).not.toHaveBeenCalled();
      const cratorHash = 'testHash';
      const result = await creatorsService.addCreator(
        cratorHash,
        mockSystemUser,
      );
      expect(creatorRepository.addCreator).toHaveBeenCalled();
      expect(result).toEqual('newCreator');
    });
  });
});
