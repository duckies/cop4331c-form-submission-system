import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('FormController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let id: number;

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

  it('should create forms', async () => {
    const resp = await request(app.getHttpServer())
      .post('/form')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Form Title',
        description: 'Form Description',
      })
      .expect(201);

    id = resp.body.id;

    expect(resp.body).toMatchObject({
      title: 'Form Title',
      description: 'Form Description',
    });
  });

  it('should retrieve forms', async () => {
    const resp = await request(app.getHttpServer())
      .get(`/form/${id}`)
      .expect(200);

    expect(resp.body).toEqual({
      id: id,
      inactive: false,
      questions: [],
      title: 'Form Title',
      description: 'Form Description',
    });
  });

  it('should update forms', async () => {
    const resp = await request(app.getHttpServer())
      .patch(`/form/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New Form Title',
        description: 'New Form Description',
        inactive: true,
      })
      .expect(200);

    expect(resp.body).toEqual({
      id,
      inactive: true,
      questions: [],
      title: 'New Form Title',
      description: 'New Form Description',
    });
  });

  it('should delete forms', async () => {
    const resp = await request(app.getHttpServer())
      .delete(`/form/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(resp.body).toEqual({
      inactive: true,
      questions: [],
      title: 'New Form Title',
      description: 'New Form Description',
    });
  });
});
