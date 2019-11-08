import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { LoggingService } from '../logging/logging.service';
import { Injectable } from '@nestjs/common';

/**
 * Maps a dotenv configuration file to a key:value record.
 * https://docs.nestjs.com/techniques/configuration
 */
@Injectable()
export class ConfigService {
  private readonly envConfig: Record<string, string>;

  constructor(private readonly logger: LoggingService) {
    const filePath = `../${process.env.NODE_ENV || 'development'}.env`;

    try {
      const file = fs.readFileSync(filePath);
      this.envConfig = dotenv.parse(file);
    } catch (error) {
      // No such file or directory error code.
      if (error.code !== 'ENOENT') {
        throw error;
      }

      this.logger.error(`The configuration file ${filePath} was not found. Shutting down!`, null, true);
    }
  }

  /**
   * Returns a value from a specified key.
   * @param key Case sensitive key
   */
  get(key: string): string {
    return this.envConfig[key];
  }

  /**
   * Returns a boolean from a specified key.
   * @param key Case sensitive key
   */
  getBoolean(key: string): boolean {
    return Boolean(this.envConfig[key]);
  }

  /**
   * Returns a numberfrom a specified key.
   * @param key Case sensitive key
   */
  getNumber(key: string): number {
    return Number(this.envConfig[key]);
  }
}
