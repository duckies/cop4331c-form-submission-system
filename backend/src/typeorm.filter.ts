import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { ArgumentsHost, ExceptionFilter, Catch } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

/**
 * Exception Filter NestJS Documentation: https://docs.nestjs.com/exception-filters
 *
 * These intercept TypeORM database errors so we can present friendlier versions to the frontend.
 * Database errors typically result in a 500 - Internal Server Error.
 *
 * Entity Not Found - 404
 *
 */

@Catch(EntityNotFoundError)
export class EntityNotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: EntityNotFoundError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse();

    response.status(404).send({ message: exception.message });
  }
}

@Catch(QueryFailedError)
export class QueryFailedExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse();

    switch (exception.code) {
      // Unique Constraint Violation
      case '23505':
        response.status(409).send({ message: 'Duplicate key violation', error: exception.message });
        break;

      default:
        throw exception;
    }
  }
}
