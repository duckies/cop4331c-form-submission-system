import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { TypeOrmConfigService } from './typeorm.service';
import { LoggingService } from './logging/logging.service';
import { LoggingModule } from './logging/logging.module';

@Module({
  imports: [
    LoggingService,
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, LoggingModule],
      useClass: TypeOrmConfigService,
      inject: [ConfigService, LoggingService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private readonly connection: Connection) {}
}
