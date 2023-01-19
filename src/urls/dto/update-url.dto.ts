import { IsNotEmpty } from 'class-validator';

export class UpdateURLDto {
  @IsNotEmpty()
  urlId: number;

  freqInMin?: number | null;

  retentionInDays?: number | null;
}
