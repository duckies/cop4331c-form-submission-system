import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('QuestionController (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    const resp = await request(app.getHttpServer())
      .post('/login')
      .send({ id: 1, password: 'admin' })
      .expect(201);

    token = resp.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return the authenticated user', async () => {
    await request(app.getHttpServer())
      .get('/user/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then((resp) => {
        expect(resp.body).toMatchObject({
          id: 1,
        });
      });
  });

  it('should return a specific user', async () => {
    await request(app.getHttpServer())
      .get('/user/1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then((resp) => {
        expect(resp.body).toMatchObject({
          id: 1,
        });
      });
  });

  it('should throw an exception if the login fails', async () => {
    await request(app.getHttpServer())
      .post('/login')
      .send({ id: 1, password: 'not-admin' })
      .expect(401);
  });

  it('should throw an exception if the JWT is invalid', async () => {
    await request(app.getHttpServer())
      .get('/user/me')
      .set('Authorization', `Bearer bogus.token`)
      .expect(401);
  });
});
