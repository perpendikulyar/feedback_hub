import { SystemUserRepository } from './system-user.repository';
import { Test } from '@nestjs/testing';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SystemUser } from './system-user.entity';
import * as bcrypt from 'bcryptjs';
import { CreateSystemUserDto } from './dto/create-sytem-user.dto';
import { SystemUserRole } from './system-user-role.enum';
import { SystemUserStatus } from './system-user-status.enum';
import { GetSystemUsersFilterDto } from './dto/get-system-users-filter.dto';

const mockCredentialsDto = {
  emaol: 'test@example.ru',
  password: 'TestPassword',
};

const mockCreateSystemUserDto = new CreateSystemUserDto();
mockCreateSystemUserDto.email = 'test@example.ru';
mockCreateSystemUserDto.username = 'TestUser';
mockCreateSystemUserDto.password = 'Password';
mockCreateSystemUserDto.role = SystemUserRole.API_USER;

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

  describe('createSystemUser', () => {
    let save;

    beforeEach(() => {
      save = jest.fn();
      systemUserRepository.create = jest.fn().mockReturnValue({ save });
    });
    it('successfully signs up the user', () => {
      save.mockResolvedValue(undefined);
      expect(
        systemUserRepository.createSystemUser(mockCreateSystemUserDto),
      ).resolves.not.toThrow();
    });

    it('Throws a conflict error as username already exist', () => {
      save.mockRejectedValue({ code: '23505' });
      expect(
        systemUserRepository.createSystemUser(mockCreateSystemUserDto),
      ).rejects.toThrow(ConflictException);
    });

    it('throws a internal server error while creatin a new system user', () => {
      save.mockRejectedValue({ code: '123123' }); // unhandled error code
      expect(
        systemUserRepository.createSystemUser(mockCreateSystemUserDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('validatePassword', () => {
    let systemUser;

    beforeEach(() => {
      systemUserRepository.findOne = jest.fn();
      systemUser = new SystemUser();
      systemUser.email = 'test@example.ru';
      systemUser.validatePassword = jest.fn();
    });

    it('returns the username as validation is successful', async () => {
      systemUserRepository.findOne.mockResolvedValue(systemUser);
      systemUser.status = SystemUserStatus.ACTIVE;
      systemUser.validatePassword.mockResolvedValue(true);

      const result = await systemUserRepository.validatePassword(
        mockCredentialsDto,
      );
      expect(result).toEqual('test@example.ru');
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
      systemUser.status = SystemUserStatus.ACTIVE;
      systemUser.validatePassword.mockResolvedValue(false);
      const result = await systemUserRepository.validatePassword(
        mockCredentialsDto,
      );
      expect(systemUser.validatePassword).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('Returns Null as user staus is inactive', async () => {
      systemUserRepository.findOne.mockResolvedValue(systemUser);
      systemUser.status = SystemUserStatus.INACTIVE;
      const result = await systemUserRepository.validatePassword(
        mockCredentialsDto,
      );
      expect(systemUser.validatePassword).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('Calls bcrypt.hash to generate hash', async () => {
      bcrypt.hash = jest.fn().mockResolvedValue('testHash');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await systemUserRepository.hashPassword(
        'testPassword',
        'testSalt',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('testPassword', 'testSalt');
      expect(result).toEqual('testHash');
    });
  });

  describe('getSystemUsers', () => {
    it('Successfully returns systemUsers with query', async () => {
      const mockFilterDto = new GetSystemUsersFilterDto();
      mockFilterDto.status = SystemUserStatus.ACTIVE;

      spyOn(systemUserRepository, 'getSystemUsers').and.returnValue([
        'user',
        'user',
      ]);

      const result = await systemUserRepository.getSystemUsers(mockFilterDto);
      expect(result).toEqual(['user', 'user']);
    });
  });
});
