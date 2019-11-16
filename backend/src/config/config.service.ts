import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { LoggingService } from '../logging/logging.service';
import Joi = require('@hapi/joi');

export type EnvConfig = Record<string, string>;

/**
 * Maps a dotenv configuration file to a key:value record.
 * https://docs.nestjs.com/techniques/configuration
 */
@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig;
  public readonly envSchema: Joi.ObjectSchema = Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .default('development'),
    PORT: Joi.number().default(3000),
    DATABASE_TYPE: Joi.string()
      .valid('postgres', 'mysql')
      .required(),
    DATABASE_HOST: Joi.string().required(),
    DATABASE_PORT: Joi.number().required(),
    DATABASE_USERNAME: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_NAME: Joi.string().required(),
    DATABASE_SYNCHRONIZE: Joi.boolean(),
    DATABASE_SSL: Joi.boolean(),
    DROP_SCHEMA: Joi.boolean()
      .optional()
      .default(false),
    TOKEN_EXPIRATION_HOURS: Joi.number().default(24),
    TOKEN_SECRET: Joi.string().required(),
  });

  constructor(filePath: string, private readonly logger: LoggingService) {
    try {
      const config = dotenv.parse(fs.readFileSync(filePath));
      this.envConfig = this.validateConfig(config);
    } catch (error) {
      // No such file or directory error code.
      if (error.code !== 'ENOENT') {
        throw error;
      }

      this.logger.error(`The configuration file ${filePath} was not found. Shutting down!`, null, true);
    }
  }

  /**
   * Checks the env file to provide the required values.
   * @param envConfig Dotenv parsed configuration file.
   */
  private validateConfig(envConfig: EnvConfig): EnvConfig {
    const { error, value: validatedEnvConfig } = this.envSchema.validate(envConfig);

    if (error) {
      this.logger.error(`Configuration validation error ${error.message}`, null, true);
    }

    return validatedEnvConfig;
  }

  /**
   * Returns a value from a specified key.
   * @param key Case sensitive key
   */
  get(key: string): string | number | boolean {
    return this.envConfig[key];
  }
}
