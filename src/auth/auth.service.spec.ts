import { AuthService } from './auth.service';
import { SystemUserRepository } from './systemUser.repository';
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

describe('Auth Service', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let systemUserRepository;

  const mockSystemUserRepository = () => ({
    validatePassword: jest.fn(),
    createSystemUser: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    findOne: jest.fn(),
  });

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
        AuthService,
        { provide: SystemUserRepository, useFactory: mockSystemUserRepository },
      ],
    }).compile();

    authService = await module.get<AuthService>(AuthService);
    jwtService = await module.get<JwtService>(JwtService);
    systemUserRepository = await module.get<SystemUserRepository>(
      SystemUserRepository,
    );
  });

  describe('createSystemUSer', () => {
    process.env.NODE_ENV = 'production';

    const mockCreateSystemUserDto = new CreateSystemUserDto();
    mockCreateSystemUserDto.email = 'test@example.ru';
    mockCreateSystemUserDto.username = 'TestUser';
    mockCreateSystemUserDto.password = 'Password';
    mockCreateSystemUserDto.role = SystemUserRole.API_USER;

    it('Should call systemUserRepository.createSystemUser only if systemuser is super_admin', async () => {
      systemUserRepository.count.mockResolvedValue(32);

      const mockSystemUser = new SystemUser();
      mockSystemUser.username = 'test username';
      mockSystemUser.role = SystemUserRole.SUPER_ADMIN;

      systemUserRepository.createSystemUser.mockResolvedValue(undefined);

      const result = await authService.createSystemUser(
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

      const mockSystemUser = new SystemUser();
      mockSystemUser.username = 'test username';
      mockSystemUser.role = SystemUserRole.API_USER;

      expect(
        authService.createSystemUser(mockCreateSystemUserDto, mockSystemUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('signIn', () => {
    it('Should calls systemUserRepository.validatePassword and generate accessToken', async () => {
      const mockEmail = 'test@example.ru';
      const mockAccessToken = 'testAccessToken';
      systemUserRepository.validatePassword.mockResolvedValue(mockEmail);
      spyOn(jwtService, 'sign').and.returnValue(mockAccessToken);

      const result = await authService.signIn(mockCredentialsDto);
      expect(systemUserRepository.update).toHaveBeenCalled();
      expect(result).toEqual({ accessToken: mockAccessToken });
    });

    it('Should calls systemUserRepository.validatePassword then returns null and thow an Unauthorized error', async () => {
      systemUserRepository.validatePassword.mockResolvedValue(null);

      expect(authService.signIn(mockCredentialsDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('updateSystemUser', () => {
    const updateSystemUserDto = new UpdateSystemUserDto();
    updateSystemUserDto.status = SystemUserStatus.INACTIVE;
    updateSystemUserDto.role = SystemUserRole.API_USER;

    const mockSystemUser = new SystemUser();
    mockSystemUser.username = 'test username';
    mockSystemUser.role = SystemUserRole.SUPER_ADMIN;

    it('Should successfully update systemUser', async () => {
      systemUserRepository.findOne.mockResolvedValue(mockSystemUser);

      const result = await authService.updateSystemUser(
        24,
        updateSystemUserDto,
        mockSystemUser,
      );

      expect(systemUserRepository.findOne).toHaveBeenCalledWith({ id: 24 });
      expect(result).toEqual(mockSystemUser);
    });

    it('Should return NotFound if it no a superadmin request', async () => {
      mockSystemUser.role = SystemUserRole.API_USER;

      expect(
        authService.updateSystemUser(24, updateSystemUserDto, mockSystemUser),
      ).rejects.toThrow(NotFoundException);
      expect(systemUserRepository.findOne).not.toHaveBeenCalled();
    });

    it('Should return BadRequest with empty DTO', async () => {
      const emptyUpdateSystemUserDto = new UpdateSystemUserDto();

      expect(
        authService.updateSystemUser(
          24,
          emptyUpdateSystemUserDto,
          mockSystemUser,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(systemUserRepository.findOne).not.toHaveBeenCalled();
    });

    it('Should return NotFound when system user does not exist', async () => {
      systemUserRepository.findOne.mockResolvedValue(null);

      const result = authService.updateSystemUser(
        24,
        updateSystemUserDto,
        mockSystemUser,
      );

      expect(systemUserRepository.findOne).toHaveBeenCalledWith({ id: 24 });

      expect(result).rejects.toThrow(NotFoundException);
    });
  });
});
