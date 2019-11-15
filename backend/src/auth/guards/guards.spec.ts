import { Test } from '@nestjs/testing';
import { JWTGuard } from './jwt.guard';
import { AuthGuard } from '@nestjs/passport';
import { LocalGuard } from './local.guard';

describe('Guards', () => {
  let jwtGuard: JWTGuard;
  let localGuard: LocalGuard;

  describe('JWTGuard', () => {
    beforeEach(async () => {
      const module = await Test.createTestingModule({
        providers: [JWTGuard],
      }).compile();

      jwtGuard = module.get<JWTGuard>(JWTGuard);
    });

    it('should exist', () => {
      expect(jwtGuard).toBeDefined();
    });

    it('should return true if it can activate', async () => {
      jest.spyOn(AuthGuard('jwt').prototype, 'canActivate').mockResolvedValueOnce(true);

      expect(await jwtGuard.canActivate(null)).toBeTruthy();
    });

    it('should throw an UnauthorizedException if it cannot activate', async () => {
      let thrownError;

      jest.spyOn(AuthGuard('jwt').prototype, 'canActivate').mockImplementation(() => {
        throw new Error('Example auth error.');
      });

      try {
        await jwtGuard.canActivate(null);
      } catch (error) {
        thrownError = error;
      }

      // This is incredibly obnoxious, investigate how to properly test for an error thrown by NestJS.
      expect(thrownError.toString()).toEqual('Error: {"statusCode":401,"error":"Unauthorized"}');
    });
  });

  describe('LocalGuard', () => {
    beforeEach(async () => {
      const module = await Test.createTestingModule({
        providers: [LocalGuard],
      }).compile();

      localGuard = module.get<LocalGuard>(LocalGuard);
    });

    it('should exist', () => {
      expect(localGuard).toBeDefined();
    });
  });

  it('should return true if it can activate', async () => {
    jest.spyOn(AuthGuard('local').prototype, 'canActivate').mockResolvedValueOnce(true);

    expect(await localGuard.canActivate(null)).toBeTruthy();
  });

  it('should throw an UnauthorizedException if it cannot activate', async () => {
    let thrownError;

    jest.spyOn(AuthGuard('local').prototype, 'canActivate').mockImplementation(() => {
      throw new Error('Example auth error.');
    });

    try {
      await localGuard.canActivate(null);
    } catch (error) {
      thrownError = error;
    }

    // This is incredibly obnoxious, investigate how to properly test for an error thrown by NestJS.
    expect(thrownError.toString()).toEqual('Error: {"statusCode":401,"error":"Unauthorized"}');
  });
});
