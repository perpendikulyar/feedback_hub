import { IsNotEmpty, IsIn } from 'class-validator';
import { ProblemType } from '../problem-type.enum';

export class CreateProblemDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsIn([
    ProblemType.NOTSET,
    ProblemType.MISPRINT,
    ProblemType.LIKES,
    ProblemType.FORMS,
    ProblemType.ADVERTISEMENT,
  ])
  type: ProblemType;
}
