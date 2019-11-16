import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JWTGuard } from '../auth/guards/jwt.guard';
import { Usr } from '../user/user.decorator';
import { User } from '../user/user.entity';
import { CreateFormDto } from './dto/create-form.dto';
import { FindFormDto } from './dto/find-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { Form } from './form.entity';
import { FormService } from './form.service';

@Controller('/form')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @UseGuards(JWTGuard)
  @Post()
  create(@Usr() user: User, @Body() createFormDto: CreateFormDto): Promise<Form> {
    return this.formService.create(user, createFormDto);
  }

  @Get(':id')
  findOne(@Param() findFormDto: FindFormDto): Promise<Form> {
    return this.formService.findOne(findFormDto.id);
  }

  @UseGuards(JWTGuard)
  @Patch(':id')
  update(@Param() findFormDto: FindFormDto, @Body() updateFormDto: UpdateFormDto): Promise<Form> {
    return this.formService.update(findFormDto.id, updateFormDto);
  }

  @UseGuards(JWTGuard)
  @Delete(':id')
  delete(@Param() findFormDto: FindFormDto): Promise<Form> {
    return this.formService.delete(findFormDto.id);
  }
}
