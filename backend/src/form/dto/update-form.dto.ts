import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateFormDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  inactive: boolean;
}
