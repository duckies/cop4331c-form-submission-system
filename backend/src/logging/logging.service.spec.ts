import { LoggingService } from './logging.service';
import { Test } from '@nestjs/testing';
import chalk from 'chalk';

describe('LoggingService', () => {
  let loggingService: LoggingService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [LoggingService],
    }).compile();

    loggingService = module.get<LoggingService>(LoggingService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('log', () => {
    it('should log a message to the console', () => {
      const consoleOutput = [];
      const expectedOutput = [`${chalk.cyan('[Log]')} ${chalk.cyan('testing')}`];
      jest.spyOn(console, 'log').mockImplementation((message: string) => consoleOutput.push(message));

      loggingService.log('testing');
      expect(consoleOutput).toEqual(expectedOutput);
    });

    it('should log errors to the console', () => {
      const consoleOutput = [];
      const expectedOutput = [`${chalk.red.bold('[ERROR]')}: ${chalk.red('testing')}`];
      jest.spyOn(console, 'error').mockImplementation((message: string) => consoleOutput.push(message));

      loggingService.error('testing');
      expect(consoleOutput).toEqual(expectedOutput);
    });

    it('should print stack traces to the console', () => {
      const consoleOutput = [];
      const expectedOutput = [`${chalk.red.bold('[ERROR]')}: ${chalk.red('testing')}`, new Error()];
      jest.spyOn(console, 'error').mockImplementation((message: string) => consoleOutput.push(message));

      loggingService.error('testing', new Error());
      expect(consoleOutput).toEqual(expectedOutput);
    });

    it('should exit if fatal', () => {
      const consoleOutput = [];
      const expectedOutput = [`${chalk.red.bold('[FATAL]')}: ${chalk.red('testing')}`, new Error()];
      jest.spyOn(console, 'error').mockImplementation((message: string) => consoleOutput.push(message));

      // We override this type as "process.exit(1)" never finishes, and
      // the only other way around this is throwing an error.
      const processSpy = (jest.spyOn(process, 'exit') as any).mockImplementation(() => {});

      loggingService.error('testing', new Error(), true);
      expect(processSpy).toBeCalled();
      expect(consoleOutput).toEqual(expectedOutput);
    });
  });
});
