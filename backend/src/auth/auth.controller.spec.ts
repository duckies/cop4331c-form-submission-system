import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Test } from '@nestjs/testing';
import { User } from '../user/user.entity';

jest.mock('./auth.service.ts');

describe('AuthController', () => {
  let authService: AuthService;
  let authController: AuthController;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authController = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('login', () => {
    it('should return a token', async () => {
      // These should be replaced by a factory function.
      const user = new User();
      user.id = 1;
      user.hash = 'placeholder';
      user.lastUpdated = new Date();

      const result = { expiresIn: 86400, token: 'tokenplaceholder' };

      jest.spyOn(authService, 'createToken').mockResolvedValue(result);

      expect(await authController.login(user)).toStrictEqual(result);
    });
  });
});
