import { TypeOrmModule } from '@nestjs/typeorm'
import { Question } from './question.entity'
import { QuestionService } from './question.service'
import { Module } from '@nestjs/common'
import { QuestionController } from './question.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Question])],
  providers: [QuestionService],
  controllers: [QuestionController],
})
export class QuestionModule {}
