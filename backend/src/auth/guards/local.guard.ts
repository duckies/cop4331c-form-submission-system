import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

/**
 * Guard to invoke password authentication.
 * Extend this guard for blacklisting and other security functionalities.
 */
export class LocalGuard extends AuthGuard('local') {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    try {
      return (await super.canActivate(ctx)) as boolean;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
