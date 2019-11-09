import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { Usr } from './user.decorator';
import { JWTGuard } from '../auth/guards/jwt.guard';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body('password') password: string): Promise<User> {
    return this.userService.create(password);
  }

  @UseGuards(JWTGuard)
  @Get('/me')
  getMe(@Usr() user: User): User {
    return user;
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<User> {
    return this.userService.findOne(id);
  }
}
