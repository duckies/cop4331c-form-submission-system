import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { LoggingModule } from './logging/logging.module';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConsoleModule } from 'nestjs-console';
import { FormModule } from './form/form.module';

@Module({
  imports: [
    ConsoleModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) =>
        ({
          type: config.get('DATABASE_TYPE'),
          host: config.get('DATABASE_HOST'),
          port: config.get('DATABASE_PORT'),
          username: config.get('DATABASE_USERNAME'),
          password: config.get('DATABASE_PASSWORD'),
          database: config.get('DATABASE_NAME'),
          ssl: config.get('DATABASE_SSL'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: config.get('DATABASE_SYNCHRONIZE'),
        } as PostgresConnectionOptions | MysqlConnectionOptions),
      inject: [ConfigService],
    }),
    LoggingModule,
    ConfigModule,
    AuthModule,
    UserModule,
    FormModule,
  ],
})
export class AppModule {
  constructor(private readonly connection: Connection) {}
}
