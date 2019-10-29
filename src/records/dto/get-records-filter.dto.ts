import { RecordStatus } from '../record-status.enum';
import { IsOptional, IsNotEmpty, IsIn } from 'class-validator';
import { RecordType } from '../record-type.enum';
import { SortOrder } from '../../utility/sortOrder.enum';

export enum RecordsSortBy {
  ID = 'record.Id',
  AUTHOR_ID = 'record.authorId',
  CREATION_DATE = 'record.creationDate',
  LAST_UPDATED_DATE = 'record.lastUpdateDate',
  STATUS = 'record.status',
  TYPE = 'record.type',
}
export class GetRecordsFilterDto {
  @IsOptional()
  @IsIn([
    RecordStatus.NEW,
    RecordStatus.RESOLVED,
    RecordStatus.SKIPPED,
    RecordStatus.TODO,
  ])
  status: RecordStatus;

  @IsOptional()
  @IsIn([
    RecordType.NOTSET,
    RecordType.MISPRINT,
    RecordType.LIKES,
    RecordType.FORMS,
    RecordType.ADVERTISEMENT,
  ])
  type: RecordType;

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
    RecordsSortBy.ID,
    RecordsSortBy.LAST_UPDATED_DATE,
    RecordsSortBy.STATUS,
    RecordsSortBy.TYPE,
    RecordsSortBy.AUTHOR_ID,
    RecordsSortBy.CREATION_DATE,
  ])
  sortBy: RecordsSortBy;

  @IsOptional()
  @IsIn([SortOrder.DESC, SortOrder.ASC])
  sortOrder: SortOrder;
}
