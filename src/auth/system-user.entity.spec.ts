import { SystemUser } from './system-user.entity';
import * as bcrypt from 'bcryptjs';
import { async } from 'rxjs/internal/scheduler/async';

describe('SystemUser entity', () => {
  let systemUser: SystemUser;

  beforeEach(() => {
    systemUser = new SystemUser();
    systemUser.username = 'testUsername';
    systemUser.password = 'testPassword';
    systemUser.salt = 'testSalt';
    bcrypt.hash = jest.fn();
  });

  describe('validatePassword', () => {
    it('returns true as password is valid', async () => {
      bcrypt.hash.mockReturnValue('testPassword');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await systemUser.validatePassword('123456');
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 'testSalt');
      expect(result).toEqual(true);
    });

    it('returns true as password is invalid', async () => {
      bcrypt.hash.mockReturnValue('wrongPassword');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await systemUser.validatePassword('wrongPassword');
      expect(bcrypt.hash).toHaveBeenCalledWith('wrongPassword', 'testSalt');
      expect(result).toEqual(false);
    });
  });
});
