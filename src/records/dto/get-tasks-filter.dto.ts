import { RecordStatus } from '../record-status.enum';
import { IsOptional, IsNotEmpty, IsIn } from 'class-validator';
import { RecordType } from '../record-type.enum';

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
  creatorId: number;

  @IsOptional()
  @IsNotEmpty()
  startDate: Date;

  @IsOptional()
  @IsNotEmpty()
  endDate: Date;
}
