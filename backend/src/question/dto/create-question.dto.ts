import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsPositive } from 'class-validator';
import { FieldType } from '../question.entity';

export class CreateQuestionDto {
  @IsNumber()
  formId: number;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  label: string;

  @IsNumber()
  @IsPositive()
  order: number;

  @IsEnum(FieldType)
  type: FieldType;

  @IsBoolean()
  required: boolean;

  @IsOptional()
  @IsString({ each: true })
  choices: string[];

  @IsOptional()
  @IsBoolean()
  multiple: true;

  @IsOptional()
  @IsNumber()
  fileMaxCount: number;

  @IsOptional()
  @IsString({ each: true })
  fileTypes: string[];

  @IsOptional()
  @IsNumber()
  fileMaxSize: number;
}
