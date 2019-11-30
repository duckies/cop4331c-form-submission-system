import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { EntityNotFoundExceptionFilter, QueryFailedExceptionFilter } from './typeorm.filter';
import { ConfigService } from './config/config.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService: ConfigService = app.get(ConfigService);

  /**
   * Whitelist all arguments so they must be described in a DTO.
   * ForbidNonWhitelisted to not allow requests with extraneous information.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  /**
   * Transforms errors received by Postgres saying an entity was not found
   * from a server error into a 404 error.
   */
  app.useGlobalFilters(new EntityNotFoundExceptionFilter());
  app.useGlobalFilters(new QueryFailedExceptionFilter());

  /**
   * Allows for communication from another domain or port.
   */
  app.enableCors();

  /**
   * Host the uploaded files.
   */
  app.useStaticAssets(join(__dirname, '../../..', 'files'));

  await app.listen(configService.get('BACKEND_PORT') as number);
}
bootstrap();
