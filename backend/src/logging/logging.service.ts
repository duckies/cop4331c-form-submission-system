import chalk from 'chalk';

export class LoggingService {
  /**
   * Prints a standard message to the console.
   * @param message Message to display to the client in the console.
   */
  log(message: string): void {
    console.log(`${chalk.cyan('[Log]')} + ${chalk.cyan(message)}`);
  }

  /**
   * Prints an error and optional trace to the console.
   * @param message Message to display to the client in the console.
   * @param error Optional error to include.
   * @param exit Close the application or not.
   */
  error(message: string, error?: Error, exit?: boolean): void {
    console.error(`${chalk.red.bold(exit ? '[FATAL]' : '[ERROR]')}: ${chalk.red(message)}`);

    if (error) {
      console.error(error);
    }

    if (exit) {
      process.exit(1);
    }
  }
}
