import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('QuestionController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let uuid: string;
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

    id = resp.body.id;

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
        order: 500,
      })
      .expect(201);

    uuid = resp.body.id;

    expect(resp.body).toMatchObject({
      title: 'Question Title',
      type: 'TextArea',
      required: true,
      order: 500,
    });
  });

  it('should not allow duplicate question orders', async () => {
    await request(app.getHttpServer())
      .post('/question')
      .set('Authorization', `Bearer ${token}`)
      .send({
        formId: 1,
        title: 'Question Title',
        type: 'TextArea',
        required: true,
        order: 500,
      })
      .expect(400);
  });

  it('should retrieve individual questions', async () => {
    const resp = await request(app.getHttpServer())
      .get(`/question/${uuid}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(resp.body).toMatchObject({
      id: uuid,
      title: 'Question Title',
      type: 'TextArea',
      required: true,
      order: 500,
    });
  });

  it('should retrieve all questions from a form', async () => {
    const resp = await request(app.getHttpServer())
      .get(`/question/form/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(resp.body).toMatchObject([
      {
        id: uuid,
        title: 'Question Title',
        type: 'TextArea',
        required: true,
        order: 500,
      },
    ]);
  });

  it('should update a question', async () => {
    const resp = await request(app.getHttpServer())
      .patch(`/question/${uuid}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New Question Title',
        label: 'Question Label',
        required: false,
      })
      .expect(200);

    expect(resp.body).toMatchObject({
      id: uuid,
      title: 'New Question Title',
      type: 'TextArea',
      required: false,
      order: 500,
      label: 'Question Label',
    });
  });

  it('should re-order questions properly', async () => {
    const questionUUIDS: string[] = [];

    // Insert 10 questions into the database.
    for (let i = 1; i <= 10; i++) {
      const resp = await request(app.getHttpServer())
        .post(`/question`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Question #' + i,
          order: i,
          type: 'TextArea',
          required: true,
          formId: 1,
        })
        .expect(201);

      questionUUIDS.push(resp.body.id);
    }

    // Move question #6 to position 1.
    let resp = await request(app.getHttpServer())
      .patch(`/question/${questionUUIDS[5]}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        order: 1,
      })
      .expect(200);

    resp = await request(app.getHttpServer())
      .get(`/question/${questionUUIDS[0]}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // Question #1 should now be at order 2.
    expect(resp.body).toMatchObject({
      order: 2,
    });

    // Move question #6 to position 10.
    resp = await request(app.getHttpServer())
      .patch(`/question/${questionUUIDS[5]}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        order: 10,
      })
      .expect(200);

    resp = await request(app.getHttpServer())
      .get(`/question/${questionUUIDS[9]}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // Question #10 should now be at order 9.
    expect(resp.body).toMatchObject({
      order: 9,
    });
  });
});
