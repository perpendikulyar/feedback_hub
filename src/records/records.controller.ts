import {
  Controller,
  Get,
  ValidationPipe,
  Post,
  UsePipes,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { RecordsService } from './records.service';
import { Record } from './record.entity';
import { CreateRecordDto } from './dto/create-rcord.dto';
import { UserCookieValidationPipe } from '../creators/pipes/user-cookie-validation.pipe';
import { GetRecordsFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { GetSystemUser } from '../auth/get-system-user.decorator';
import { SystemUser } from '../auth/system-user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('records')
@UseGuards(AuthGuard())
export class RecordsController {
  constructor(private recordsService: RecordsService) {}

  @Post()
  @UsePipes(ValidationPipe)
  createRecord(
    @Body() createRecordDto: CreateRecordDto,
    @Body('userCookie', UserCookieValidationPipe) userCookie: string,
    @GetSystemUser() systemUser: SystemUser,
  ): Promise<Record> {
    return this.recordsService.createRecord(
      createRecordDto,
      userCookie,
      systemUser,
    );
  }

  @Get()
  getRecords(
    @Query(ValidationPipe) getRecordsFilterDto: GetRecordsFilterDto,
    @GetSystemUser() systemUser: SystemUser,
  ): Promise<Record[]> {
    return this.recordsService.getRecords(getRecordsFilterDto, systemUser);
  }

  @Get('/:id')
  getRecordById(
    @Param('id', ParseIntPipe) id: number,
    @GetSystemUser() systemUser: SystemUser,
  ): Promise<Record> {
    return this.recordsService.getRecordById(id, systemUser);
  }

  @Patch('/:id')
  updateRecord(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateRecordDto: UpdateRecordDto,
    @GetSystemUser() systemUser: SystemUser,
  ): Promise<Record> {
    return this.recordsService.updateRecord(id, updateRecordDto, systemUser);
  }

  @Delete('/:id')
  deleteRecord(
    @Param('id', ParseIntPipe) id: number,
    @GetSystemUser() systemUser: SystemUser,
  ): Promise<void> {
    return this.recordsService.deleteRecord(id, systemUser);
  }
}
