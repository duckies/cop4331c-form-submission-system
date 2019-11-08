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
    return {
      type: this.config.get('DATABASE_TYPE'),
      host: this.config.get('DATABASE_HOST'),
      port: this.config.getNumber('DATABASE_PORT'),
      username: this.config.get('DATABASE_USERNAME'),
      password: this.config.get('DATABASE_PASSWORD'),
      database: this.config.get('DATABASE_NAME'),
      entities: ['backend/src/**/*.entity{.ts,.js}'],
      synchronize: this.config.getBoolean('DATABASE_SYNCHRONIZE'),
      ssl: this.config.getBoolean('DATABASE_SSL'),
    } as PostgresConnectionOptions | MysqlConnectionOptions;
  }
}
