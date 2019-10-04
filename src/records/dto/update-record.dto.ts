import { RecordStatus } from '../record-status.enum';
import { IsOptional, IsIn } from 'class-validator';
import { RecordType } from '../record-type.enum';

export class UpdateRecordDto {
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
}
