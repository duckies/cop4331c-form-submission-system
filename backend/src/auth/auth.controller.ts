import { Controller, Post, UseGuards } from '@nestjs/common';
import { Usr } from '../user/user.decorator';
import { User } from '../user/user.entity';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalGuard)
  @Post('login')
  async login(@Usr() user: User): Promise<{ expiresIn: number; token: string }> {
    return this.authService.createToken(user);
  }
}
