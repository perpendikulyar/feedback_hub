import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { CreateSystemUserDto } from './dto/create-sytem-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetSystemUser } from './get-system-user.decorator';
import { SystemUser } from './system-user.entity';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('AuthController');

  constructor(private authService: AuthService) {}

  /* Comment this guard on first run to create Super Admin */
  /* @UseGuards(AuthGuard()) */
  @Post('/createSystemUser')
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
}
