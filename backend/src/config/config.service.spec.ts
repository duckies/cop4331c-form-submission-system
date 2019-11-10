import { Test } from '@nestjs/testing';
import { LoggingService } from '../logging/logging.service';
import { ConfigService } from './config.service';

jest.mock('./config.service.ts');

/**
 * These tests are rather nonsensical. I don't think you can mock
 * static properties like the envConfig object, this may need to be
 * strictly an e2e tested file.
 */

describe('ConfigService', () => {
  let configService: ConfigService;
  let loggingService: LoggingService;

  beforeEach(() => {
    // Clears instances and constructor calls.
    jest.clearAllMocks();
  });

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [ConfigService, LoggingService],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
    loggingService = module.get<LoggingService>(LoggingService);
  });

  it('should be defined', () => {
    expect(configService).toBeDefined();
  });

  it('should return a string or undefined on get()', () => {
    expect(ConfigService).not.toHaveBeenCalled();

    const configService = new ConfigService(loggingService);

    expect(ConfigService).toHaveBeenCalledTimes(1);

    expect(configService.get('DATABASE_PORT')).toBeUndefined();
  });

  it('should return a boolean on getBoolean()', () => {
    expect(ConfigService).not.toHaveBeenCalled();

    const configService = new ConfigService(loggingService);

    expect(ConfigService).toHaveBeenCalledTimes(1);

    expect(configService.getBoolean('DATABASE_SSL')).toBeFalsy();
  });

  it('should return a number or undefiend on getNumber()', () => {
    expect(ConfigService).not.toHaveBeenCalled();

    const configService = new ConfigService(loggingService);

    expect(ConfigService).toHaveBeenCalledTimes(1);

    expect(configService.getNumber('DATABASE_PORT')).toBeUndefined();
  });
});
