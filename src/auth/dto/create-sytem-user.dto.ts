import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
  IsIn,
} from 'class-validator';
import { SystemUserRole } from '../system-user-role.enum';

export class CreateSystemUserDto {
  @IsString()
  @MinLength(6)
  @MaxLength(24)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak',
  })
  password: string;

  @IsNotEmpty()
  @IsIn([SystemUserRole.API_USER, SystemUserRole.SUPER_ADMIN])
  role: SystemUserRole;
}
