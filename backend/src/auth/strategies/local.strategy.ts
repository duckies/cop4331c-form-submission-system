import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from '../../user/user.entity';
import { AuthService } from '../auth.service';

/**
 * Local strategy for password authentication.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    // It's not possible to remove the "username" field.
    // This is usually changed to an email field, but login without some
    // identifier is typically nonsensical. We can use the user id in its stead
    // and it protects against the possibility of failure if added other users.
    super({
      usernameField: 'id',
    });
  }

  /**
   * This is an overloaded method of the Passport library's local strategy.
   * Returning a user means login is successful.
   *
   * @param password Plaintest password.
   */
  async validate(id: number, password: string): Promise<User> {
    const user = await this.authService.validateAdmin(id, password);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
