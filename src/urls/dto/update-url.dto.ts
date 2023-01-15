import { IsNotEmpty } from 'class-validator';

export class UpdateURLDto {
  @IsNotEmpty()
  urlId: number;

  @IsNotEmpty()
  freqInMin: number;
}
