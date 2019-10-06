import { Test } from '@nestjs/testing';
import { CreatorRepository } from './creator.repository';
import { SystemUser } from '../auth/system-user.entity';

const mockCreatorHach = 'testHash';

const mockSystemUser = new SystemUser();
mockSystemUser.id = 1;
mockSystemUser.username = 'testName';

describe('CreatorRepository', () => {
  let creatorRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CreatorRepository],
    }).compile();

    creatorRepository = await module.get<CreatorRepository>(CreatorRepository);
  });

  describe('addCreator', () => {
    let save;

    beforeEach(() => {
      save = jest.fn();
      creatorRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('Succssefully added new creator', async () => {
      save.mockResolvedValue(undefined);
      expect(
        creatorRepository.addCreator(mockCreatorHach, mockSystemUser),
      ).resolves.not.toThrow();
    });
  });
});
