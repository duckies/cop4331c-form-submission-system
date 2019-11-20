import { Module, Global } from '@nestjs/common';
import { ConfigService } from './config.service';
import { LoggingService } from '../logging/logging.service';

@Global()
@Module({
  providers: [ConfigService, LoggingService],
  exports: [ConfigService],
})
export class ConfigModule {}
