import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard to invoke JWT authentication.
 * Extend this guard for blacklisting and other security functionalities.
 */
export class JWTGuard extends AuthGuard('jwt') {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    try {
      return (await super.canActivate(ctx)) as boolean;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
