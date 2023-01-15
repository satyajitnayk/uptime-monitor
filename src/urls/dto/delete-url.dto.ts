import { IsNotEmpty } from 'class-validator';

export class DeleteURLDto {
  @IsNotEmpty()
  urlId: number;
}
