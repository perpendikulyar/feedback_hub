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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { CreateSystemUserDto } from './dto/create-sytem-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetSystemUser } from './get-system-user.decorator';
import { SystemUser } from './system-user.entity';
import { SystemUserRole } from './system-user-role.enum';
import { NotFoundException } from '@nestjs/common';
import { UpdateSystemUserDto } from './dto/update-system-user.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('AuthController');

  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard())
  @Post('/systemUser')
  createSystemUser(
    @Body(ValidationPipe) createSystemUserDto: CreateSystemUserDto,
    @GetSystemUser() systemUser: SystemUser,
  ): Promise<void> {
    this.logger.verbose(
      `Trying creating new user with username "${
        createSystemUserDto.username
      }"`,
    );
    return this.authService.createSystemUser(createSystemUserDto, systemUser);
  }

  @Post('/signin')
  signIn(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    this.logger.verbose(`User trying to sign in`);
    return this.authService.signIn(authCredentialsDto);
  }

  @UseGuards(AuthGuard())
  @Patch('/systemUser/:id')
  updateSystemUser(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateSystemUserDto: UpdateSystemUserDto,
    @GetSystemUser() systemUser: SystemUser,
  ): Promise<SystemUser> {
    return this.authService.updateSystemUser(
      id,
      updateSystemUserDto,
      systemUser,
    );
  }

  @Post('/systemUser/createSuperAdmin')
  createSuperAdmin() {
    if (process.env.NODE_ENV !== 'production') {
      const superAdminDTO: CreateSystemUserDto = {
        email: 'test@example.ru',
        username: 'superAdmin',
        password: 'SuperSecret',
        role: SystemUserRole.SUPER_ADMIN,
      };
      this.logger.debug('Creating systemUser with role super_admin');
      return this.authService.createSystemUser(superAdminDTO, null);
    } else {
      this.logger.verbose('Someone trying to create superadmin users');
      throw new NotFoundException();
    }
  }
}
