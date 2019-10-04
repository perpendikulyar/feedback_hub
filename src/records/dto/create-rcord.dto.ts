import { IsNotEmpty, IsIn } from 'class-validator';
import { RecordType } from '../record-type.enum';

export class CreateRecordDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsIn([
    RecordType.NOTSET,
    RecordType.MISPRINT,
    RecordType.LIKES,
    RecordType.FORMS,
    RecordType.ADVERTISEMENT,
  ])
  type: RecordType;
}
