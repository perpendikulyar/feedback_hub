import { ProblemStatus } from '../problem-status.enum';
import { IsOptional, IsIn } from 'class-validator';
import { ProblemType } from '../problem-type.enum';

export class UpdateProblemDto {
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
}
