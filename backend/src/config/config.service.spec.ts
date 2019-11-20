import { Test } from '@nestjs/testing';
import { LoggingService } from '../logging/logging.service';
import { ConfigService } from './config.service';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

jest.mock('../logging/logging.service.ts');
jest.mock('fs');
jest.mock('dotenv');

describe('ConfigService', () => {
  let loggingService: LoggingService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [LoggingService],
    }).compile();

    loggingService = module.get<LoggingService>(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an error if the file cannot be found', () => {
    jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => {
      const error = new Error();
      Object.assign(error, { code: 'ENOENT' });
      throw error;
    });

    const logger = jest.spyOn(loggingService, 'error').mockImplementation(() => {});

    new ConfigService(loggingService);

    expect(logger).toBeCalledTimes(1);
  });

  it('should throw unknown errors', () => {
    jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => {
      throw new Error();
    });

    expect(() => new ConfigService(loggingService)).toThrow();
  });

  it('should throw errors on invalid env configs', () => {
    jest.spyOn(fs, 'readFileSync').mockResolvedValueOnce(null as never);
    const loggerSpy = jest.spyOn(loggingService, 'error').mockImplementation(() => {});

    // @ts-ignore This bypasses the method being declared private.
    new ConfigService(loggingService).validateConfig({ EXAMPLE: 'testing' });

    expect(loggerSpy).toBeCalledTimes(1);
  });

  it('should return keys on valid configuration', () => {
    const envConfig = {
      NODE_ENV: 'development',
      PORT: '3000',
      DATABASE_TYPE: 'postgres',
      DATABASE_HOST: 'localhost',
      DATABASE_PORT: '3306',
      DATABASE_USERNAME: 'local',
      DATABASE_PASSWORD: 'local',
      DATABASE_NAME: 'localdb',
      DATABASE_SYNCHRONIZE: 'false',
      DATABASE_SSL: 'false',
      TOKEN_EXPIRATION_HOURS: '24',
      TOKEN_SECRET: 'secret',
    };

    jest.spyOn(fs, 'readFileSync').mockReturnValueOnce('empty');
    jest.spyOn(dotenv, 'parse').mockReturnValueOnce(envConfig);

    const configService = new ConfigService(loggingService);

    expect(configService.get('PORT')).toBe(3000);
    expect(configService.get('DATABASE_TYPE')).toBe('postgres');
    expect(configService.get('DATABASE_SSL')).toBe(false);
  });
});
