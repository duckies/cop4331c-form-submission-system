import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MimeTypes } from '../src/question/question.entity';

describe('SubmissionController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let formId: number;
  let uuid: string;
  let firstUUID: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    let resp = await request(app.getHttpServer())
      .post('/login')
      .send({ id: 1, password: 'admin' })
      .expect(201);

    token = resp.body.token;

    resp = await request(app.getHttpServer())
      .post('/form')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Submission Testing Form' })
      .expect(201);

    formId = resp.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should disallow submittion to forms with no questions', async () => {
    await request(app.getHttpServer())
      .post(`/submission/${formId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'TextArea Question', formId, order: 1, type: 'TextArea', required: true })
      .expect(400);
  });

  it('should store new submissions', async () => {
    await request(app.getHttpServer())
      .post('/question')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'TextArea Question', formId, order: 1, type: 'TextArea', required: true })
      .expect(201)
      .then((resp) => (uuid = resp.body.id));

    await request(app.getHttpServer())
      .post(`/submission/${formId}`)
      .set('Authorization', `Bearer ${token}`)
      .field(uuid, 'Textual answer...')
      .expect(201)
      .then((resp) => {
        expect(resp.body).toMatchObject({
          formId: formId.toString(),
          answers: {
            [uuid]: 'Textual answer...',
          },
          id: 1,
        });
        firstUUID = uuid;
      });
  });

  it('should disallow submissions with no input data', async () => {
    await request(app.getHttpServer())
      .post(`/submission/${formId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });

  it('should error if a required question is not filled out', async () => {
    await request(app.getHttpServer())
      .post(`/submission/${formId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('fake-uuid', 'fake answer')
      .expect(400, {
        statusCode: 400,
        error: 'Bad Request',
        message: `Question '${uuid}' is required.`,
      });
  });

  it('should skip non-required questions', async () => {
    await request(app.getHttpServer())
      .patch(`/question/${uuid}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ required: false })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/submission/${formId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('fake-uuid', 'fake answer')
      .expect(201);
  });

  it('should should immediately', async () => {
    await request(app.getHttpServer())
      .patch(`/question/${uuid}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ required: false })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/submission/${formId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('fake-uuid', 'fake answer')
      .expect(201);
  });

  it('should store the full file response', async () => {
    await request(app.getHttpServer())
      .post('/question')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'FileInput Question',
        formId,
        order: 2,
        type: 'FileInput',
        required: true,
        fileMaxCount: 1,
        mimeTypes: [MimeTypes.PDF],
      })
      .then((resp) => (uuid = resp.body.id));

    await request(app.getHttpServer())
      .post(`/submission/${formId}`)
      .set('Authorization', `Bearer ${token}`)
      .attach(uuid, __dirname + '/fixtures/document.pdf')
      .expect(201)
      .then((resp) => {
        expect(resp.body).toMatchObject({
          answers: {
            [uuid]: [
              {
                fieldname: uuid,
                originalname: 'document.pdf',
                encoding: '7bit',
                mimetype: 'application/pdf',
                destination: '../files',
                size: 25660,
              },
            ],
          },
        });
      });
  });

  it('should disallow multiple responses for questions disallowing it', async () => {
    await request(app.getHttpServer())
      .patch(`/question/${uuid}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ required: false })
      .expect(200);

    await request(app.getHttpServer())
      .post('/question')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Select Question',
        formId,
        order: 3,
        type: 'Dropdown',
        required: true,
        multiple: false,
        choices: ['Apple', 'Banana'],
      })
      .then((resp) => (uuid = resp.body.id));

    await request(app.getHttpServer())
      .post(`/submission/${formId}`)
      .set('Authorization', `Bearer ${token}`)
      .field(uuid, 'Apple')
      .field(uuid, 'Banana')
      .expect(400, {
        statusCode: 400,
        error: 'Bad Request',
        message: `Question '${uuid}' does not allow multiple values.`,
      });
  });

  it('should disallow non-choice answers', async () => {
    await request(app.getHttpServer())
      .post(`/submission/${formId}`)
      .set('Authorization', `Bearer ${token}`)
      .field(uuid, 'Not Apples')
      .expect(400, {
        statusCode: 400,
        error: 'Bad Request',
        message: `Question '${uuid}' does not allow the option 'Not Apples'`,
      });
  });

  it('should disallow non-choice answers in an array', async () => {
    await request(app.getHttpServer())
      .patch(`/question/${uuid}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ multiple: true })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/submission/${formId}`)
      .set('Authorization', `Bearer ${token}`)
      .field(uuid, 'Not Apples')
      .field(uuid, 'Banana')
      .expect(400, {
        statusCode: 400,
        error: 'Bad Request',
        message: `Question '${uuid}' only allows the choices: {Apple,Banana}. Be careful of duplicates.`,
      });
  });

  it('should disallow repeat answers in an array', async () => {
    await request(app.getHttpServer())
      .post(`/submission/${formId}`)
      .set('Authorization', `Bearer ${token}`)
      .field(uuid, 'Apple')
      .field(uuid, 'Apple')
      .expect(400, {
        statusCode: 400,
        error: 'Bad Request',
        message: `Question '${uuid}' only allows the choices: {Apple,Banana}. Be careful of duplicates.`,
      });
  });

  it('should retrieve individual submissions', async () => {
    await request(app.getHttpServer())
      .get(`/submission/1`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then((resp) =>
        expect(resp.body).toMatchObject({
          id: 1,
          formId: 1,
          answers: {
            [firstUUID]: 'Textual answer...',
          },
        }),
      );
  });

  it('should retrieve multiple submissions', async () => {
    await request(app.getHttpServer())
      .get(`/submission/form/${formId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then((resp) => {
        expect(Array.isArray(resp.body));
        expect(resp.body[0]).toMatchObject({
          id: 1,
          formId: 1,
          answers: {
            [firstUUID]: 'Textual answer...',
          },
        });
      });
  });
});
