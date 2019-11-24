import { IsNumberString } from 'class-validator';

export class FindFormsDto {
  @IsNumberString()
  readonly take!: number;

  @IsNumberString()
  readonly skip!: number;
}
