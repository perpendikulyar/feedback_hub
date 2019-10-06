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
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { RecordsService } from './records.service';
import { Record } from './record.entity';
import { CreateRecordDto } from './dto/create-rcord.dto';
import { CreatorHashValidationPipe } from '../creators/pipes/creator-hash-validation.pipe';
import { GetRecordsFilterDto } from './dto/get-records-filter.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { GetSystemUser } from '../auth/get-system-user.decorator';
import { SystemUser } from '../auth/system-user.entity';
import { AuthGuard } from '@nestjs/passport';
import { Logger } from '@nestjs/common';
import { CreatorsService } from '../creators/creators.service';
import { Creator } from 'src/creators/creator.entity';

@Controller('records')
@UseGuards(AuthGuard())
export class RecordsController {
  private readonly logger = new Logger('RecordsController');

  constructor(
    private recordsService: RecordsService,
    private creatorsService: CreatorsService,
  ) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createRecord(
    @Body() createRecordDto: CreateRecordDto,
    @Body('creatorHash', CreatorHashValidationPipe) creatorHash: string,
    @GetSystemUser() systemUser: SystemUser,
    @Req() req: Request,
  ): Promise<Record> {
    this.logger.verbose(
      `User "${
        systemUser.username
      }" trying to create new record with data: ${JSON.stringify(
        createRecordDto,
      )}; and creator hash: ${creatorHash}`,
    );

    const creator: Creator = await this.creatorsService.mergeCreator(
      creatorHash,
      systemUser,
    );

    return this.recordsService.createRecord(
      createRecordDto,
      creator,
      systemUser,
      req,
    );
  }

  @Get()
  getRecords(
    @Query(ValidationPipe) getRecordsFilterDto: GetRecordsFilterDto,
    @GetSystemUser() systemUser: SystemUser,
  ): Promise<Record[]> {
    this.logger.verbose(
      `User "${
        systemUser.username
      }" trying to get records with filters: ${JSON.stringify(
        getRecordsFilterDto,
      )}`,
    );
    return this.recordsService.getRecords(getRecordsFilterDto, systemUser);
  }

  @Get('/:id')
  getRecordById(
    @Param('id', ParseIntPipe) id: number,
    @GetSystemUser() systemUser: SystemUser,
  ): Promise<Record> {
    this.logger.verbose(
      `User "${systemUser.username}" trying to get record with id: ${id}`,
    );
    return this.recordsService.getRecordById(id, systemUser);
  }

  @Patch('/:id')
  updateRecord(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateRecordDto: UpdateRecordDto,
    @GetSystemUser() systemUser: SystemUser,
  ): Promise<Record> {
    this.logger.verbose(
      `User "${
        systemUser.username
      }" trying to update record with id: ${id}; new data: ${JSON.stringify(
        UpdateRecordDto,
      )}`,
    );
    return this.recordsService.updateRecord(id, updateRecordDto, systemUser);
  }

  @Delete('/:id')
  deleteRecord(
    @Param('id', ParseIntPipe) id: number,
    @GetSystemUser() systemUser: SystemUser,
  ): Promise<void> {
    this.logger.verbose(
      `User "${systemUser.username}" trying to delete record with id: ${id}`,
    );
    return this.recordsService.deleteRecord(id, systemUser);
  }
}
