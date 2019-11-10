import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should return for create()', async () => {
    const user = new User();

    jest.spyOn(userRepository, 'save').mockResolvedValueOnce(user);

    expect(await userService.create('fancypassword')).toEqual(user);
  });

  it('should return for findOne()', async () => {
    const user = new User();

    jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValueOnce(user);

    expect(await userService.findOne(1)).toEqual(user);
  });

  it('should return for setPassword()', async () => {
    const user = new User();

    jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValueOnce(user);
    jest.spyOn(user, 'save').mockResolvedValueOnce(user);

    expect(await userService.setPassword('password')).toEqual(user);
  });

  it('should return false for compareHash() if not matching', async () => {
    const password = 'example';
    const hash = 'example';

    expect(await userService.compareHash(password, hash)).toBeFalsy();
  });
});
