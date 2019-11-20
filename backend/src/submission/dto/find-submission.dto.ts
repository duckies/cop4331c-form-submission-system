import { IsNumberString } from 'class-validator';

export class FindSubmissionDto {
  @IsNumberString()
  id: number;
}
