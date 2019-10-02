import { IsDefined, IsString } from 'class-validator';

export class GetHelloDto {
  @IsDefined()
  @IsString()
  name: string;
}
