import { SystemUserRole } from '../system-user-role.enum';
import { SystemUserStatus } from '../system-user-status.enum';
import { IsOptional, IsIn } from 'class-validator';
export class UpdateSystemUserDto {
  @IsOptional()
  @IsIn([SystemUserRole.SUPER_ADMIN, SystemUserRole.API_USER])
  role: SystemUserRole;

  @IsOptional()
  @IsIn([SystemUserStatus.ACTIVE, SystemUserStatus.INACTIVE])
  status: SystemUserStatus;
}
