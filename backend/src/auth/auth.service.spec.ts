import { AuthService } from './auth.service';
import { Test } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { ConfigService } from '../config/config.service';
import { User } from '../user/user.entity';

jest.mock('../user/user.service.ts');
jest.mock('../config/config.service.ts');
// Not mocking the sign function creates tokens we cannot
// predict since there is a timed component.
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('placeholder'),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let configService: ConfigService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthService, UserService, ConfigService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createToken', () => {
    it('should return a token', async () => {
      const user = new User();
      user.id = 1;
      user.hash = 'placeholder';
      user.lastUpdated = new Date();

      jest.spyOn(configService, 'get').mockReturnValueOnce(24);
      jest.spyOn(configService, 'get').mockReturnValueOnce('secret');

      expect(await authService.createToken(user)).toMatchObject({ expiresIn: 86400, token: 'placeholder' });
    });
  });

  describe('validateAdmin', () => {
    const user = new User();
    user.id = 1;
    user.hash = 'placeholder';
    user.lastUpdated = new Date();

    it('should return the admin with correct password', async () => {
      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      jest.spyOn(userService, 'compareHash').mockImplementation(async (password: string, hash: string) => {
        return password === hash;
      });
      expect(await authService.validateAdmin(1, 'placeholder')).toBe(user);
    });

    it('should return null with an incorrect password', async () => {
      user.hash = 'notplaceholder';
      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      jest.spyOn(userService, 'compareHash').mockImplementation(async (password: string, hash: string) => {
        return password === hash;
      });
      expect(await authService.validateAdmin(1, 'placeholder')).toBeNull();
    });
  });
});
