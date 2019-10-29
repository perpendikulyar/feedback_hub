import { SortOrder } from '../../utility/sortOrder.enum';
import { IsOptional, IsNotEmpty, IsNumber, IsIn } from 'class-validator';

export enum ReviewSortBy {
  ID = 'review.id',
  CATEGORY = 'review.category',
  RATING = 'review.rating',
  CREATION_DATE = 'review.creationDate',
  AUTHOR_ID = 'review.authorId',
}

export class GetReviewsFilterDto {
  @IsOptional()
  @IsNotEmpty()
  searchQuery: string;

  @IsOptional()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsIn([0, 1, 2, 3, 4, 5])
  rating: number;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  authorId: number;

  @IsOptional()
  @IsNotEmpty()
  creationStartDate: Date;

  @IsOptional()
  @IsNotEmpty()
  creationEndDate: Date;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  page: number;

  @IsOptional()
  @IsIn([
    ReviewSortBy.AUTHOR_ID,
    ReviewSortBy.CATEGORY,
    ReviewSortBy.ID,
    ReviewSortBy.RATING,
    ReviewSortBy.CREATION_DATE,
  ])
  sortBy: ReviewSortBy;

  @IsOptional()
  @IsIn([SortOrder.DESC, SortOrder.ASC])
  sortOrder: SortOrder;
}
