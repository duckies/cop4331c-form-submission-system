import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('QuestionController (e2e)', () => {
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

  it('should store new questions in a form', async () => {
    let resp = await request(app.getHttpServer())
      .post('/form')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Form With Question Title',
        description: 'Form Description',
      })
      .expect(201);

    expect(resp.body).toMatchObject({
      id: 1,
      title: 'Form With Question Title',
      description: 'Form Description',
    });

    resp = await request(app.getHttpServer())
      .post('/question')
      .set('Authorization', `Bearer ${token}`)
      .send({
        formId: 1,
        title: 'Question Title',
        type: 'TextArea',
        required: true,
        order: 1,
      })
      .expect(201);

    expect(resp.body).toMatchObject({
      title: 'Question Title',
      type: 'TextArea',
      required: true,
      order: 1,
    });
  });
});
