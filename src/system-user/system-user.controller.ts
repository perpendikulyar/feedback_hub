import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Logger,
  Patch,
  UseGuards,
  Param,
  ParseIntPipe,
  Get,
  Query,
} from '@nestjs/common';
import { SystemUserService } from './system-user.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { CreateSystemUserDto } from './dto/create-sytem-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetSystemUser } from './get-system-user.decorator';
import { SystemUser } from './system-user.entity';
import { SystemUserRole } from './system-user-role.enum';
import { NotFoundException } from '@nestjs/common';
import { UpdateSystemUserDto } from './dto/update-system-user.dto';
import { GetSystemUsersFilterDto } from './dto/get-system-users-filter.dto';

@Controller('systemUsers')
export class SystemUserController {
  private readonly logger = new Logger('SystemUserController');

  constructor(private sytemUserService: SystemUserService) {}

  @UseGuards(AuthGuard())
  @Post()
  createSystemUser(
    @Body(ValidationPipe) createSystemUserDto: CreateSystemUserDto,
    @GetSystemUser() systemUser: SystemUser,
  ): Promise<void> {
    this.logger.verbose(
      `Trying creating new user with username "${
        createSystemUserDto.username
      }"`,
    );
    return this.sytemUserService.createSystemUser(
      createSystemUserDto,
      systemUser,
    );
  }

  @UseGuards(AuthGuard())
  @Get()
  getSystemUsers(
    @Query(ValidationPipe) getSystemUsersFilterDto: GetSystemUsersFilterDto,
    @GetSystemUser() systemUser: SystemUser,
  ): Promise<SystemUser[]> {
    this.logger.verbose(
      `SystemUser ${
        systemUser.username
      } trying to fetch systemusers with filter ${JSON.stringify(
        getSystemUsersFilterDto,
      )}`,
    );
    return this.sytemUserService.getSystemUsers(
      getSystemUsersFilterDto,
      systemUser,
    );
  }

  @UseGuards(AuthGuard())
  @Get('/:id')
  getSystemUserById(
    @Param('id', ParseIntPipe) id: number,
    @GetSystemUser() systemUser: SystemUser,
  ): Promise<SystemUser> {
    this.logger.verbose(
      `SystemUser ${
        systemUser.username
      } trying to fetch systemUsers with ID ${id}`,
    );
    return this.sytemUserService.getSystemUserById(id, systemUser);
  }

  @Post('/signin')
  signIn(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    this.logger.verbose(`User trying to sign in`);
    return this.sytemUserService.signIn(authCredentialsDto);
  }

  @UseGuards(AuthGuard())
  @Patch('/:id')
  updateSystemUser(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateSystemUserDto: UpdateSystemUserDto,
    @GetSystemUser() systemUser: SystemUser,
  ): Promise<SystemUser> {
    this.logger.verbose(
      `SystemUser ${
        systemUser.username
      } trying to update systemusers with ID ${id} and new data ${JSON.stringify(
        updateSystemUserDto,
      )}`,
    );
    return this.sytemUserService.updateSystemUser(
      id,
      updateSystemUserDto,
      systemUser,
    );
  }

  @Post('/createSuperAdmin')
  createSuperAdmin(): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      const superAdminDTO: CreateSystemUserDto = {
        email: 'test@example.ru',
        username: 'superAdmin',
        password: 'SuperSecret',
        role: SystemUserRole.SUPER_ADMIN,
      };
      this.logger.debug('Creating systemUser with role super_admin');
      return this.sytemUserService.createSystemUser(superAdminDTO, null);
    } else {
      this.logger.verbose('Someone trying to create superadmin users');
      throw new NotFoundException();
    }
  }
}
