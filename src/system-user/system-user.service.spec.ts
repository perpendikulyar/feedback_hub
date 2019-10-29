import { SystemUserService } from './system-user.service';
import { SystemUserRepository } from './system-user.repository';
import { Test } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import {
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateSystemUserDto } from './dto/create-sytem-user.dto';
import { SystemUserRole } from './system-user-role.enum';
import { SystemUser } from './system-user.entity';
import { UpdateSystemUserDto } from './dto/update-system-user.dto';
import { SystemUserStatus } from './system-user-status.enum';
import { GetSystemUsersFilterDto } from './dto/get-system-users-filter.dto';
import { async } from 'rxjs/internal/scheduler/async';

describe('System User Service', () => {
  let systemUserService: SystemUserService;
  let jwtService: JwtService;
  let systemUserRepository;

  const mockSystemUserRepository = () => ({
    validatePassword: jest.fn(),
    createSystemUser: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    findOne: jest.fn(),
    getSystemUsers: jest.fn(),
  });

  const mockSystemUser = new SystemUser();

  const mockCredentialsDto = {
    email: 'test@example.ru',
    password: 'TestPassword',
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'testSecret',
          signOptions: {
            expiresIn: 3600,
          },
        }),
      ],
      providers: [
        SystemUserService,
        { provide: SystemUserRepository, useFactory: mockSystemUserRepository },
      ],
    }).compile();

    systemUserService = await module.get<SystemUserService>(SystemUserService);
    jwtService = await module.get<JwtService>(JwtService);
    systemUserRepository = await module.get<SystemUserRepository>(
      SystemUserRepository,
    );

    mockSystemUser.username = 'test user';
    mockSystemUser.email = 'test@example.ru';
    mockSystemUser.role = SystemUserRole.SUPER_ADMIN;

    process.env.NODE_ENV = 'production';
  });

  describe('createSystemUser', () => {
    const mockCreateSystemUserDto = new CreateSystemUserDto();
    mockCreateSystemUserDto.email = 'test@example.ru';
    mockCreateSystemUserDto.username = 'TestUser';
    mockCreateSystemUserDto.password = 'Password';
    mockCreateSystemUserDto.role = SystemUserRole.API_USER;

    it('Should call systemUserRepository.createSystemUser only if systemuser is super_admin', async () => {
      systemUserRepository.createSystemUser.mockResolvedValue(undefined);

      const result = await systemUserService.createSystemUser(
        mockCreateSystemUserDto,
        mockSystemUser,
      );
      expect(systemUserRepository.createSystemUser).toHaveBeenCalledWith(
        mockCreateSystemUserDto,
      );
      expect(result).toBe(undefined);
    });

    it('Should return NotFoundException when systemUser is not super_admin', async () => {
      systemUserRepository.count.mockResolvedValue(32);

      mockSystemUser.role = SystemUserRole.API_USER;

      expect(
        systemUserService.createSystemUser(
          mockCreateSystemUserDto,
          mockSystemUser,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('signIn', () => {
    it('Should calls systemUserRepository.validatePassword and generate accessToken', async () => {
      const mockEmail = 'test@example.ru';
      const mockAccessToken = 'testAccessToken';
      systemUserRepository.validatePassword.mockResolvedValue(mockEmail);
      spyOn(jwtService, 'sign').and.returnValue(mockAccessToken);

      const result = await systemUserService.signIn(mockCredentialsDto);
      expect(systemUserRepository.update).toHaveBeenCalled();
      expect(result).toEqual({ accessToken: mockAccessToken });
    });

    it('Should calls systemUserRepository.validatePassword then returns null and thow an Unauthorized error', async () => {
      systemUserRepository.validatePassword.mockResolvedValue(null);

      expect(systemUserService.signIn(mockCredentialsDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getSytemUsers', () => {
    const mockGetSystemUsersFilterDto = new GetSystemUsersFilterDto();
    mockGetSystemUsersFilterDto.status = SystemUserStatus.ACTIVE;

    it('Should call getSystemUsers and successfully return array of system users', async () => {
      systemUserRepository.getSystemUsers.mockResolvedValue('some value');
      const result = await systemUserService.getSystemUsers(
        mockGetSystemUsersFilterDto,
        mockSystemUser,
      );

      expect(systemUserRepository.getSystemUsers).toHaveBeenCalledWith(
        mockGetSystemUsersFilterDto,
      );
      expect(result).toEqual('some value');
    });

    it('Should call getSystemUsers and return array not found as caller is not super admin', async () => {
      mockSystemUser.role = SystemUserRole.API_USER;

      expect(
        systemUserService.getSystemUsers(
          mockGetSystemUsersFilterDto,
          mockSystemUser,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(systemUserRepository.getSystemUsers).not.toHaveBeenCalledWith(
        mockGetSystemUsersFilterDto,
      );
    });
  });

  describe('getSystemUserById', () => {
    it('Should call getSystemUsersById and return array not found as caller is not super admin', () => {
      mockSystemUser.role = SystemUserRole.API_USER;
      expect(
        systemUserService.getSystemUserById(2, mockSystemUser),
      ).rejects.toThrow(NotFoundException);
      expect(systemUserRepository.findOne).not.toHaveBeenCalledWith({ id: 2 });
    });

    it('Should call getSystemUsersById and return array not found if callable SystemUser does not exist', () => {
      systemUserRepository.findOne.mockResolvedValue(undefined);
      const result = systemUserService.getSystemUserById(2, mockSystemUser);
      expect(systemUserRepository.findOne).toHaveBeenCalledWith({ id: 2 });
      expect(result).rejects.toThrow(NotFoundException);
    });

    it('Should call getSystemUsersById and successfully return callable SystemUser', async () => {
      systemUserRepository.findOne.mockResolvedValue('some value');
      const result = await systemUserService.getSystemUserById(
        2,
        mockSystemUser,
      );
      expect(systemUserRepository.findOne).toHaveBeenCalledWith({ id: 2 });
      expect(result).toEqual('some value');
    });
  });

  describe('updateSystemUser', () => {
    const updateSystemUserDto = new UpdateSystemUserDto();
    updateSystemUserDto.status = SystemUserStatus.INACTIVE;
    updateSystemUserDto.role = SystemUserRole.API_USER;

    it('Should successfully update systemUser', async () => {
      const updatable = new SystemUser();
      updatable.id = 24;
      updatable.username = 'test updatable username';
      updatable.save = jest.fn();

      spyOn(systemUserService, 'getSystemUserById').and.returnValue(updatable);
      const result = await systemUserService.updateSystemUser(
        24,
        updateSystemUserDto,
        mockSystemUser,
      );
      expect(systemUserService.getSystemUserById).toHaveBeenCalledWith(
        24,
        mockSystemUser,
      );
      expect(updatable.save).toHaveBeenCalled();
      expect(result).toEqual(updatable);
    });

    it('Should return NotFound if it no a superadmin request', () => {
      mockSystemUser.role = SystemUserRole.API_USER;

      spyOn(systemUserService, 'getSystemUserById');

      expect(
        systemUserService.updateSystemUser(
          24,
          updateSystemUserDto,
          mockSystemUser,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(systemUserService.getSystemUserById).not.toHaveBeenCalled();
    });

    it('Should return BadRequest with empty DTO', () => {
      const emptyUpdateSystemUserDto = new UpdateSystemUserDto();
      spyOn(systemUserService, 'getSystemUserById');

      expect(
        systemUserService.updateSystemUser(
          24,
          emptyUpdateSystemUserDto,
          mockSystemUser,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(systemUserService.getSystemUserById).not.toHaveBeenCalled();
    });
  });
});
