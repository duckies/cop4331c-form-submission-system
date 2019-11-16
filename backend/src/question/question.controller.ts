import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JWTGuard } from '../auth/guards/jwt.guard';
import { FindFormDto } from '../form/dto/find-form.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { FindQuestionDto } from './dto/find-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './question.entity';
import { QuestionService } from './question.service';

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

  @UseGuards(JWTGuard)
  @Patch(':id')
  update(@Param() findQuestionDto: FindQuestionDto, @Body() updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    return this.questionService.update(findQuestionDto.id, updateQuestionDto);
  }
}
