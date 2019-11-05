import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { SystemUserModule } from '../src/system-user/system-user.module';
import { SystemUserService } from '../src/system-user/system-user.service';
import { SystemUserRepository } from '../src/system-user/system-user.repository';

describe('SystemUsersControlle (e2e)', () => {
  let app: INestApplication;

  const mockSystemUserService = {
    getSystemUsers: () => ['test_1', 'test_2'],
  };

  const mockSystemUserRepository = {
    getSystemUser: () => ['test_1', 'test_2'],
  };

  const auth = { token: '' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SystemUserModule],
    })
      .overrideProvider(SystemUserService)
      .useValue(mockSystemUserService)
      .overrideProvider(SystemUserRepository)
      .useValue(mockSystemUserRepository)
      .compile();

    app = module.createNestApplication();
    await app.init();

    request(app.getHttpServer())
      .post('systemUsers/signin')
      .send({ email: 'test@example.ru', password: 'SuperSecret' })
      .end(function callback(err, res) {
        auth.token = res.body.token;
      });
  });

  describe('/systemUsers (GET)', () => {
    it('should return an anauthorised request with 401 error code', () => {
      return request(app.getHttpServer())
        .get('/systemUsers')
        .expect(401);
    });
    it('should returna an array of systemUsers', () => {
      return request(app.getHttpServer())
        .get('systemUsers')
        .set('Authorization', 'bearer ' + auth.token);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
