import { Module, Global } from '@nestjs/common';
import { ConfigService } from './config.service';
import { LoggingService } from '../logging/logging.service';

@Global()
@Module({
  providers: [
    {
      inject: [LoggingService],
      provide: ConfigService,
      useValue: new ConfigService(`${process.env.configPath || '../config.env'}`, new LoggingService()),
    },
    LoggingService,
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
