import { Injectable } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { ConfigService } from '../config/config.service';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService, private readonly config: ConfigService) {}

  async createToken(user: User): Promise<{ expiresIn: number; token: string }> {
    const expiresIn = (this.config.get('TOKEN_EXPIRATION_HOURS') as number) * 3600;
    const secretOrKey = this.config.get('TOKEN_SECRET');

    return {
      expiresIn,
      token: sign({ id: user.id }, secretOrKey, { expiresIn }),
    };
  }

  /**
   * Logs in the administrator with their password.
   * @param id Account id.
   * @param password Plaintext password.
   */
  async validateAdmin(id: number, password: string): Promise<User> {
    const user = await this.userService.findOne(id);

    if (user && (await this.userService.compareHash(password, user.hash))) {
      return user;
    }

    return null;
  }
}
