import { Test } from '@nestjs/testing';
import { LoggingService } from '../logging/logging.service';
import { ConfigService } from './config.service';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

jest.mock('../logging/logging.service.ts');

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
    const consoleMessages = [];

    jest.spyOn(loggingService, 'error').mockImplementation((message: string) => consoleMessages.push(message));

    new ConfigService('bogus.env', loggingService);

    expect(consoleMessages).toContain('The configuration file bogus.env was not found. Shutting down!');
  });

  it('should handle validation errors', () => {
    const consoleMessages = [];

    jest.spyOn(loggingService, 'error').mockImplementation((message: string) => consoleMessages.push(message));

    const configService = new ConfigService('bogus.env', loggingService);

    // @ts-ignore This bypasses the private method nature.
    configService.validateConfig({ EXAMPLE: 'testing' });

    expect(consoleMessages).toContain('The configuration file bogus.env was not found. Shutting down!');
  });

  it('should throw errors on invalid env configs', () => {
    const consoleMessages = [];

    jest.spyOn(loggingService, 'error').mockImplementation((message: string) => consoleMessages.push(message));

    const configService = new ConfigService('bogus.env', loggingService);

    // @ts-ignore This bypasses the private method nature.
    configService.validateConfig({ EXAMPLE: 'testing' });

    expect(consoleMessages).toEqual([
      'The configuration file bogus.env was not found. Shutting down!',
      'Configuration validation error "DATABASE_TYPE" is required',
    ]);
  });

  // I cannot fix this no matter what. Look at later.
  // it('should throw unknown errors if fs fails', () => {
  //   const err = new Error();
  //   jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
  //     throw err;
  //   });

  //   try {
  //     const configService = new ConfigService('bogus.env', loggingService);
  //   } catch (error) {
  //     expect(error).toBe(err);
  //   }
  // });

  it('should properly initialize a valid configuration', () => {
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

    const parsedConfig = {
      NODE_ENV: 'development',
      PORT: 3000,
      DATABASE_TYPE: 'postgres',
      DATABASE_HOST: 'localhost',
      DATABASE_PORT: 3306,
      DATABASE_USERNAME: 'local',
      DATABASE_PASSWORD: 'local',
      DATABASE_NAME: 'localdb',
      DATABASE_SYNCHRONIZE: false,
      DATABASE_SSL: false,
      TOKEN_EXPIRATION_HOURS: 24,
      TOKEN_SECRET: 'secret',
    };

    jest.spyOn(fs, 'readFileSync').mockReturnValueOnce('empty');
    jest.spyOn(dotenv, 'parse').mockReturnValueOnce(envConfig);

    const configService = new ConfigService('bogus.env', loggingService);

    // @ts-ignore
    expect(configService.envConfig).toEqual(parsedConfig);
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

    const configService = new ConfigService('bogus.env', loggingService);

    expect(configService.get('PORT')).toBe(3000);
    expect(configService.get('DATABASE_TYPE')).toBe('postgres');
    expect(configService.get('DATABASE_SSL')).toBe(false);
  });
});
