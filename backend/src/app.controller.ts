import { Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { GetHelloDto } from './dto/get-hello.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  getHello(getHelloDto: GetHelloDto): string {
    console.log(getHelloDto);
    return this.appService.getHello();
  }
}
// /user/
