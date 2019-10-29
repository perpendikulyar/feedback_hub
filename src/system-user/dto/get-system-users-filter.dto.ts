import { SystemUserStatus } from '../system-user-status.enum';
import { SystemUserRole } from '../system-user-role.enum';
import {
  IsOptional,
  IsNotEmpty,
  IsEmail,
  IsIn,
  IsNumber,
} from 'class-validator';
import { SortOrder } from '../../utility/sortOrder.enum';

export enum SystemUserSortBy {
  ID = 'systemUser.id',
  USERNAME = 'systemUser.username',
  EMAIL = 'systemUser.email',
  STATUS = 'systemUser.status',
  ROLE = 'systemUser.role',
}

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

  @IsOptional()
  @IsNumber()
  page: number;

  @IsOptional()
  @IsIn([
    SystemUserSortBy.EMAIL,
    SystemUserSortBy.ID,
    SystemUserSortBy.ROLE,
    SystemUserSortBy.STATUS,
    SystemUserSortBy.USERNAME,
  ])
  sortBy: SystemUserSortBy;

  @IsOptional()
  @IsIn([SortOrder.DESC, SortOrder.ASC])
  sortOrder: SortOrder;
}
