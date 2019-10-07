import { AuthService } from './auth.service';
import { SystemUserRepository } from './systemUser.repository';
import { Test } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { CreateSystemUserDto } from './dto/create-sytem-user.dto';
import { SystemUserRole } from './system-user-role.enum';

describe('Auth Service', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let systemUserRepository;

  const mockSystemUserRepository = () => ({
    validatePassword: jest.fn(),
    createSystemUser: jest.fn(),
    update: jest.fn(),
  });

  const mockCredentialsDto = {
    username: 'TestUsername',
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
    it('Should call systemUserRepository.createSystemUser', async () => {
      const mockCreateSystemUserDto = new CreateSystemUserDto();
      mockCreateSystemUserDto.username = 'TestUser';
      mockCreateSystemUserDto.password = 'Password';
      mockCreateSystemUserDto.role = SystemUserRole.API_USER;

      systemUserRepository.createSystemUser.mockResolvedValue(undefined);

      const result = await authService.createSystemUser(
        mockCreateSystemUserDto,
      );
      expect(systemUserRepository.createSystemUser).toHaveBeenCalledWith(
        mockCreateSystemUserDto,
      );
      expect(result).toBe(undefined);
    });
  });

  describe('signIn', () => {
    it('Should calls systemUserRepository.validatePassword and generate accessToken', async () => {
      const mockUsername = 'TestUsername';
      const mockAccessToken = 'testAccessToken';
      systemUserRepository.validatePassword.mockResolvedValue(mockUsername);
      spyOn(jwtService, 'sign').and.returnValue(mockAccessToken);

      const result = await authService.signIn(mockCredentialsDto);
      expect(systemUserRepository.update).toHaveBeenCalled();
      expect(result).toEqual({ accessToken: mockAccessToken });
    });

    it('Should calls systemUserRepository.validatePassword then returns null and thow an Unauthorized error', () => {
      systemUserRepository.validatePassword.mockResolvedValue(null);

      expect(authService.signIn(mockCredentialsDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
