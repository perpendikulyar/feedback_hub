import { SystemUserStatus } from '../system-user-status.enum';
import { SystemUserRole } from '../system-user-role.enum';
import { IsOptional, IsNotEmpty, IsEmail, IsIn } from 'class-validator';

export class GetSystemUsersFilterDto {
  @IsOptional()
  @IsNotEmpty()
  username: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsIn([SystemUserStatus.ACTIVE, SystemUserStatus.INACTIVE])
  status: SystemUserStatus;

  @IsOptional()
  @IsIn([SystemUserRole.SUPER_ADMIN, SystemUserRole.API_USER])
  role: SystemUserRole;
}
