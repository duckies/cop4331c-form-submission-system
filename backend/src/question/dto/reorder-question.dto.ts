import { IsUUID, IsNumber, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ReorderDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @IsNotEmpty()
  order: number;
}

export class ReorderQuestionDto {
  @ValidateNested({ each: true })
  @Type(() => ReorderDto)
  questions: ReorderDto[];
}
