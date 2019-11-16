import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { EntityNotFoundExceptionFilter, QueryFailedExceptionFilter } from './typeorm.filter'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)

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
  )

  /**
   * Transforms errors received by Postgres saying an entity was not found
   * from a server error into a 404 error.
   */
  app.useGlobalFilters(new EntityNotFoundExceptionFilter())
  app.useGlobalFilters(new QueryFailedExceptionFilter())

  await app.listen(process.env.PORT || 3000)
}
bootstrap()
