import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { JWTGuard } from './jwt.guard';
import { LocalGuard } from './local.guard';

/**
 * These are actually end to end tests, which means
 * they will need to be separated in the future.
 * File will need to be renamed appropriately!
 */

function createTestModule(guard): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [AppModule],
    providers: [
      {
        provide: APP_GUARD,
        useValue: guard,
      },
    ],
  }).compile();
}

describe('Guards', () => {
  let app: INestApplication;

  afterEach(async () => {
    await app.close();
  });

  describe('JWTGuard', () => {
    it(`should prevent access (unauthorized)`, async () => {
      app = (await createTestModule(new JWTGuard())).createNestApplication();
      await app.init();

      return request(app.getHttpServer())
        .get('/user/me')
        .expect(401);
    });
  });

  describe('LocalGuard', () => {
    it(`should prevent access (unauthorized)`, async () => {
      app = (await createTestModule(new LocalGuard())).createNestApplication();
      await app.init();

      return request(app.getHttpServer())
        .post('/login')
        .expect(401);
    });
  });
});
