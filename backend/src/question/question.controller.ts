import { Body, Controller, Get, Param, Patch, Post, UseGuards, Query, Delete } from '@nestjs/common';
import { JWTGuard } from '../auth/guards/jwt.guard';
import { FindFormDto } from '../form/dto/find-form.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { FindQuestionDto } from './dto/find-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './question.entity';
import { QuestionService } from './question.service';
import { QuestionTypeDto } from './dto/find-question-type.dto';
import { ReorderQuestionDto } from './dto/reorder-question.dto';

@Controller('/question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @UseGuards(JWTGuard)
  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto): Promise<Question> {
    return this.questionService.create(createQuestionDto);
  }

  @Get(':id')
  findOne(@Param() findQuestionDto: FindQuestionDto): Promise<Question> {
    return this.questionService.findOne(findQuestionDto.id);
  }

  @Get('/form/:id')
  findByForm(@Param() findFormDto: FindFormDto): Promise<Question[]> {
    return this.questionService.findByForm(findFormDto.id);
  }

  @Get('/type/:id')
  findByFormAndType(@Param() findFormDto: FindFormDto, @Query() questionTypeDto: QuestionTypeDto): Promise<Question[]> {
    return this.questionService.findByFormAndType(findFormDto.id, questionTypeDto.type);
  }

  @UseGuards(JWTGuard)
  @Patch('/reorder')
  reorder(@Body() reorderQuestionDto: ReorderQuestionDto): Promise<void[]> {
    return this.questionService.reorder(reorderQuestionDto);
  }

  @UseGuards(JWTGuard)
  @Patch(':id')
  update(@Param() findQuestionDto: FindQuestionDto, @Body() updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    return this.questionService.update(findQuestionDto.id, updateQuestionDto);
  }

  @UseGuards(JWTGuard)
  @Delete(':id')
  delete(@Param() findQuestionDto: FindQuestionDto): Promise<Question> {
    return this.questionService.delete(findQuestionDto.id);
  }
}
