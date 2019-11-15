import { Body, Controller, Post, UseGuards, Get, Param, Patch, Delete } from '@nestjs/common';
import { JWTGuard } from '../auth/guards/jwt.guard';
import { Usr } from '../user/user.decorator';
import { User } from '../user/user.entity';
import { CreateFormDto } from './dto/create-form.dto';
import { Form } from './form.entity';
import { FormService } from './form.service';
import { UpdateFormDto } from './dto/update-form.dto';

@Controller('/form')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @UseGuards(JWTGuard)
  @Post()
  create(@Usr() user: User, @Body() createFormDto: CreateFormDto): Promise<Form> {
    return this.formService.create(user, createFormDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Form> {
    return this.formService.findOne(id);
  }

  @UseGuards(JWTGuard)
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateFormDto: UpdateFormDto): Promise<Form> {
    return this.formService.update(id, updateFormDto);
  }

  @UseGuards(JWTGuard)
  @Delete(':id')
  delete(@Param('id') id: number): Promise<Form> {
    return this.formService.delete(id);
  }
}
