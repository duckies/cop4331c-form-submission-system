import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from './config/config.service';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { LoggingService } from './logging/logging.service';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly config: ConfigService, private readonly logger: LoggingService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const connection = {
      type: this.config.get('DATABASE_TYPE'),
      host: this.config.get('DATABASE_HOST'),
      port: this.config.getNumber('DATABASE_PORT'),
      username: this.config.get('DATABASE_USERNAME'),
      password: this.config.get('DATABASE_PASSWORD'),
      database: this.config.get('DATABASE_NAME'),
      entities: ['backend/src/**/*.entity{.ts,.js}'],
      synchronize: this.config.getBoolean('DATABASE_SYNCHRONIZE'),
      ssl: this.config.getBoolean('DATABASE_SSL'),
    };

    if (!connection.type) {
      this.logger.error('The database type was not provided in the database options.', null, true);
    } else if (connection.type !== 'postgres' && connection.type !== 'mysql') {
      this.logger.error(
        `The database type ${connection.type} is not supported. Please only use 'postgres' for PostgreSQL or 'mysql' for MySQL.`,
      );
    }

    if (!connection.host) {
      this.logger.error('The host was not specified in the database options.', null, true);
    }

    if (!connection.port) {
      this.logger.error('The port was not specified in the database options.', null, true);
    }

    if (!connection.username) {
      this.logger.error('The username was not specified in the database options.', null, true);
    }

    if (!connection.password) {
      this.logger.error('The password was not specified in the database options.', null, true);
    }

    if (!connection.database) {
      this.logger.error('The database was not specified in the database options.', null, true);
    }

    return connection as PostgresConnectionOptions | MysqlConnectionOptions;
  }
}
