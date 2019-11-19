import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { FieldType, MimeTypes } from '../question.entity';

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
  @IsArray()
  @IsEnum(MimeTypes, { each: true })
  mimeTypes?: MimeTypes[];
}
