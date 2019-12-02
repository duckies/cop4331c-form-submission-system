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

    expect(Array.isArray(resp.body));
  });

  it('should should not allow creation of FileInput fields without fileMaxCount', async () => {
    await request(app.getHttpServer())
      .post('/question')
      .set('Authorization', `Bearer ${token}`)
      .send({
        formId: 1,
        title: 'FileInput Title',
        type: 'FileInput',
        required: true,
        order: 501,
      })
      .expect(400, {
        statusCode: 400,
        error: 'Bad Request',
        message: "'fileMaxCount' property was not found and is required for a FileInput field.",
      });
  });

  it('should not allow creation of FileInput fields without mimeTypes', async () => {
    await request(app.getHttpServer())
      .post('/question')
      .set('Authorization', `Bearer ${token}`)
      .send({
        formId: 1,
        title: 'FileInput Title',
        type: 'FileInput',
        fileMaxCount: 1,
        required: true,
        order: 501,
      })
      .expect(400, {
        statusCode: 400,
        error: 'Bad Request',
        message: "'mimeTypes' property was not found and is required for a FileInput field.",
      });
  });

  /**
   * Update method.
   */

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

  /**
   * FindByFormAndType Method
   */
  it('should return an array of questions by form', async () => {
    await request(app.getHttpServer())
      .get('/question/type/1?type=TextArea')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then(resp => expect(Array.isArray(resp.body)));
  });
});
