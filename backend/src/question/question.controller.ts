import { Controller, Post, UseGuards, Body, Param, Patch } from '@nestjs/common'
import { JWTGuard } from '../auth/guards/jwt.guard'
import { CreateQuestionDto } from './dto/create-question.dto'
import { Question } from './question.entity'
import { QuestionService } from './question.service'
import { UpdateQuestionDto } from './dto/update-question.dto'

@Controller('/question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @UseGuards(JWTGuard)
  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto): Promise<Question> {
    return this.questionService.create(createQuestionDto)
  }

  @UseGuards(JWTGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    return this.questionService.update(id, updateQuestionDto)
  }
}
