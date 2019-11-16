import { IsNumberString } from 'class-validator';

export class FindFormDto {
  @IsNumberString()
  id: number;
}
