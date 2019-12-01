import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  mixin,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { transformException } from '@nestjs/platform-express/multer/multer/multer.utils';
import { Request, Response } from 'express';
import * as multer from 'multer';
import { Observable } from 'rxjs';
import { FieldType, Question } from '../question/question.entity';
import { QuestionService } from '../question/question.service';

/**
 * Interceptor that downloads the FileInput fields for a form
 * and checks the file schemas for multer.
 */
export function MulterInterceptor(): Type<NestInterceptor> {
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    constructor(private readonly questionService: QuestionService) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
      const ctx = context.switchToHttp();
      const req: Request = ctx.getRequest();
      const res: Response = ctx.getResponse();

      // Retrieve file upload questions for this form.
      const questions: Question[] = await this.questionService.findByFormAndType(
        parseInt(req.params.id, 10),
        FieldType.FileInput,
      );

      // Rejects or approves the file based on the mimetype.
      // Multer will determine if the field exists before calling this function.
      const fileFilter = (req, file, cb): void => {
        const question = questions.find((q: Question) => q.id === file.fieldname);

        // See 'question.entity.ts' for why this has to be truncated.
        const mimetype =
          file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ? 'application/vnd.openxmlformats-officedocument'
            : file.mimetype;

        if (!question.mimeTypes.includes(mimetype)) {
          cb(new BadRequestException(`Question ${file.fieldname} does not allow mimetype '${file.mimetype}'`), false);
        }

        cb(null, true);
      };

      await new Promise((resolve, reject) => {
        const storage = multer.diskStorage({
          destination: function(req, file, cb) {
            cb(null, '../files');
          },
          filename: function(req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname);
          },
        });
        const fields = questions.map((q: Question) => ({ name: q.id, maxCount: q.fileMaxCount }));

        multer({ storage, fileFilter }).fields(fields)(req, res, (err: Error) => {
          if (err) {
            const error = transformException(err);
            return reject(error);
          }
          resolve();
        });
      });

      return next.handle();
    }
  }

  const Interceptor = mixin(MixinInterceptor);
  return Interceptor as Type<NestInterceptor>;
}
