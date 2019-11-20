import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { MimeTypes } from '../question.entity';

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  order?: number;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsString({ each: true })
  choices?: string[];

  @IsOptional()
  @IsBoolean()
  multiple?: true;

  @IsOptional()
  @IsNumber()
  fileMaxCount?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(MimeTypes, { each: true })
  mimeTypes?: MimeTypes[];
}
