import { AuthService } from './auth.service';
import { UseGuards, Post, Request, Controller } from '@nestjs/common';
import { LocalGuard } from './guards/local.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalGuard)
  @Post('login')
  async login(@Request() req): Promise<{ expiresIn: number; token: string }> {
    return this.authService.createToken(req.user);
  }
}
