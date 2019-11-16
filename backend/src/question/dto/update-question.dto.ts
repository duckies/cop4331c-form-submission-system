import { IsString, IsNumber, IsOptional, IsBoolean, IsPositive } from 'class-validator'

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  label?: string

  @IsOptional()
  @IsNumber()
  @IsPositive()
  order?: number

  @IsOptional()
  @IsBoolean()
  required?: boolean

  @IsOptional()
  @IsString({ each: true })
  choices?: string[]

  @IsOptional()
  @IsBoolean()
  multiple?: true

  @IsOptional()
  @IsNumber()
  fileMaxCount?: number

  @IsOptional()
  @IsString({ each: true })
  fileTypes?: string[]

  @IsOptional()
  @IsNumber()
  fileMaxSize?: number
}
