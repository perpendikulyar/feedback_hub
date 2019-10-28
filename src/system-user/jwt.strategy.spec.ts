import { JwtStrategy } from './jwt.strategy';
import { SystemUserRepository } from './system-user.repository';
import { Test } from '@nestjs/testing';
import { SystemUser } from './system-user.entity';
import { UnauthorizedException } from '@nestjs/common';

const mockSystemUserRepository = () => ({
  findOne: jest.fn(),
});

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let systemUserRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: SystemUserRepository, useFactory: mockSystemUserRepository },
      ],
    }).compile();

    jwtStrategy = await module.get<JwtStrategy>(JwtStrategy);
    systemUserRepository = await module.get<SystemUserRepository>(
      SystemUserRepository,
    );
  });

  describe('validate', () => {
    it('validates and returns the user based on JWT payload', async () => {
      const systemUser = new SystemUser();
      systemUser.email = 'test@example.ru';

      systemUserRepository.findOne.mockResolvedValue(systemUser);
      const result = await jwtStrategy.validate({ email: 'test@example.ru' });
      expect(systemUserRepository.findOne).toHaveBeenCalledWith({
        email: 'test@example.ru',
      });
      expect(result).toEqual(systemUser);
    });

    it('throws an unauthorized exception as user cannot be found', () => {
      systemUserRepository.findOne.mockResolvedValue(null);
      expect(
        jwtStrategy.validate({ email: 'test@example.ru' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
