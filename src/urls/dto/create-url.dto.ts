import { IsNotEmpty, IsString } from 'class-validator';

export class CreateURLDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsNotEmpty()
  freqInMin?: number = 5;
}
