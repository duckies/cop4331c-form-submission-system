import { Console, Command, ConsoleService } from 'nestjs-console';
import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';

@Injectable()
@Console()
export class UserConsole {
  constructor(private readonly userService: UserService, private readonly consoleService: ConsoleService) {}

  @Command({
    command: 'setpwd <password>',
    description: 'Changes the admin password.',
  })
  async changePassword(password: string): Promise<void> {
    const spinner = ConsoleService.createSpinner();
    spinner.start('Changing the administrator password.');

    await this.userService.setPassword(password);

    spinner.succeed('Password change successful.');

    process.exit(0);
  }
}
