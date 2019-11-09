import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { UserConsole } from './user.console';
import { ConsoleModule } from 'nestjs-console';

@Module({
  imports: [ConsoleModule, TypeOrmModule.forFeature([User])],
  providers: [UserService, UserConsole],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
