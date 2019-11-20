import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserConsole } from './user.console';

jest.mock('./user.service');

describe('UserConsole', () => {
  let userService: UserService;
  let userConsole: UserConsole;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, UserConsole],
    }).compile();

    userService = module.get<UserService>(UserService);
    userConsole = module.get<UserConsole>(UserConsole);
  });

  it('should change the admin password', async () => {
    const processSpy = (jest.spyOn(process, 'exit') as any).mockImplementation(() => {});
    const userSpy = jest.spyOn(userService, 'setPassword').mockImplementation(() => undefined);

    await userConsole.changePassword('password');

    expect(processSpy).toBeCalledTimes(1);
    expect(userSpy).toBeCalledTimes(1);
  });
});
