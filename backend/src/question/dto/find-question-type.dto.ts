import { FieldType } from '../question.entity';
import { IsEnum } from 'class-validator';

export class QuestionTypeDto {
  @IsEnum(FieldType)
  type: FieldType;
}
