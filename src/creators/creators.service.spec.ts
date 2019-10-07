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

const mockCreator = { creatorHash: 'testHash' };

const mockCreatorHash = 'testHash';

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
      creatorRepository.findOne.mockResolvedValue(mockCreator);

      expect(creatorRepository.findOne).not.toHaveBeenCalled();

      const result = await creatorsService.getCreatorByCreatorHash(
        mockCreatorHash,
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
      const result = await creatorsService.addCreator(
        mockCreatorHash,
        mockSystemUser,
      );
      expect(creatorRepository.addCreator).toHaveBeenCalled();
      expect(result).toEqual('newCreator');
    });
  });

  describe('mergeCreator', () => {
    it('Try to run creatorService.getCreatorByCreatirHash', async () => {
      spyOn(creatorsService, 'getCreatorByCreatorHash').and.returnValue(
        Promise.resolve(mockCreator),
      );
      spyOn(creatorsService, 'addCreator');

      const result = await creatorsService.mergeCreator(
        mockCreatorHash,
        mockSystemUser,
      );
      expect(creatorsService.getCreatorByCreatorHash).toHaveBeenCalledWith(
        mockCreatorHash,
        mockSystemUser,
      );
      expect(creatorsService.addCreator).not.toHaveBeenCalled();
      expect(result).toEqual(mockCreator);
    });

    it('should call `addCreator`', async () => {
      spyOn(creatorsService, 'getCreatorByCreatorHash').and.returnValue(
        Promise.resolve(undefined),
      );
      spyOn(creatorsService, 'addCreator').and.returnValue(
        Promise.resolve(mockCreator),
      );

      const result = await creatorsService.mergeCreator(
        mockCreatorHash,
        mockSystemUser,
      );

      expect(creatorsService.addCreator).toHaveBeenCalledWith(
        mockCreatorHash,
        mockSystemUser,
      );
      expect(result).toEqual(mockCreator);
    });
  });
});
