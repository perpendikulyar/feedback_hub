import { ProblemStatus } from '../problem-status.enum';
import { IsOptional, IsNotEmpty, IsIn } from 'class-validator';
import { ProblemType } from '../problem-type.enum';
import { SortOrder } from '../../utility/sortOrder.enum';

export enum ProblemSortBy {
  ID = 'problem.Id',
  AUTHOR_ID = 'problem.authorId',
  CREATION_DATE = 'problem.creationDate',
  LAST_UPDATED_DATE = 'problem.lastUpdateDate',
  STATUS = 'problem.status',
  TYPE = 'problem.type',
}
export class GetProblemsFilterDto {
  @IsOptional()
  @IsIn([
    ProblemStatus.NEW,
    ProblemStatus.RESOLVED,
    ProblemStatus.SKIPPED,
    ProblemStatus.TODO,
  ])
  status: ProblemStatus;

  @IsOptional()
  @IsIn([
    ProblemType.NOTSET,
    ProblemType.MISPRINT,
    ProblemType.LIKES,
    ProblemType.FORMS,
    ProblemType.ADVERTISEMENT,
  ])
  type: ProblemType;

  @IsOptional()
  @IsNotEmpty()
  searchQuery: string;

  @IsOptional()
  @IsNotEmpty()
  authorId: number;

  @IsOptional()
  @IsNotEmpty()
  creationStartDate: Date;

  @IsOptional()
  @IsNotEmpty()
  creationEndDate: Date;

  @IsOptional()
  @IsNotEmpty()
  updatedStartDate: Date;

  @IsOptional()
  @IsNotEmpty()
  updatedEndDate: Date;

  @IsOptional()
  @IsNotEmpty()
  page: number;

  @IsOptional()
  @IsIn([
    ProblemSortBy.ID,
    ProblemSortBy.LAST_UPDATED_DATE,
    ProblemSortBy.STATUS,
    ProblemSortBy.TYPE,
    ProblemSortBy.AUTHOR_ID,
    ProblemSortBy.CREATION_DATE,
  ])
  sortBy: ProblemSortBy;

  @IsOptional()
  @IsIn([SortOrder.DESC, SortOrder.ASC])
  sortOrder: SortOrder;
}
