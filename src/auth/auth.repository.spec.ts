import { SystemUserRepository } from './systemUser.repository';
import { Test } from '@nestjs/testing';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SystemUser } from './system-user.entity';
import { userInfo } from 'os';

const mockCredentialsDto = {
  username: 'TestUsername',
  password: 'TestPassword',
};

describe('SystemUserRepository', () => {
  let systemUserRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [SystemUserRepository],
    }).compile();

    systemUserRepository = await module.get<SystemUserRepository>(
      SystemUserRepository,
    );
  });

  describe('signUp', () => {
    let save;

    beforeEach(() => {
      save = jest.fn();
      systemUserRepository.create = jest.fn().mockReturnValue({ save });
    });
    it('successfully signs up the user', () => {
      save.mockResolvedValue(undefined);
      expect(
        systemUserRepository.signUp(mockCredentialsDto),
      ).resolves.not.toThrow();
    });

    it('Throws a conflict error as username already exist', () => {
      save.mockRejectedValue({ code: '23505' });
      expect(systemUserRepository.signUp(mockCredentialsDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws a internal server error while creatin a new system user', () => {
      save.mockRejectedValue({ code: '123123' }); // unhandled error code
      expect(systemUserRepository.signUp(mockCredentialsDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('validatePassword', () => {
    let systemUser;

    beforeEach(() => {
      systemUserRepository.findOne = jest.fn();
      systemUser = new SystemUser();
      systemUser.username = 'TestUsername';
      systemUser.validatePassword = jest.fn();
    });

    it('returns the username as validation is successful', async () => {
      systemUserRepository.findOne.mockResolvedValue(systemUser);
      systemUser.validatePassword.mockResolvedValue(true);

      const result = await systemUserRepository.validatePassword(
        mockCredentialsDto,
      );
      expect(result).toEqual('TestUsername');
    });

    it('Returns Null as user cannot be found', async () => {
      systemUserRepository.findOne.mockResolvedValue(null);
      const result = await systemUserRepository.validatePassword(
        mockCredentialsDto,
      );
      expect(systemUser.validatePassword).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('Returns Null as password is invalid', async () => {
      systemUserRepository.findOne.mockResolvedValue(systemUser);
      systemUser.validatePassword.mockResolvedValue(false);
      const result = await systemUserRepository.validatePassword(
        mockCredentialsDto,
      );
      expect(systemUser.validatePassword).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
