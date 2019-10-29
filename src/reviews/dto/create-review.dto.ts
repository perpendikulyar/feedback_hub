import { IsNotEmpty, IsOptional, IsIn, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsOptional()
  @IsIn([0, 1, 2, 3, 4, 5])
  rating: number;

  @IsOptional()
  @IsString()
  category: string;
}
