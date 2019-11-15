import { IsString, IsOptional } from 'class-validator';

export class CreateFormDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}