import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecordRepository } from './record.repository';
import { Record } from './record.entity';
import { CreateRecordDto } from './dto/create-rcord.dto';
import { Author } from '../authors/author.entity';
import { GetRecordsFilterDto } from './dto/get-records-filter.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { SystemUser } from '../system-user/system-user.entity';
import { Request } from 'express';
import { SystemUserRole } from '../system-user/system-user-role.enum';
import { DeleteResult } from 'typeorm';

@Injectable()
export class RecordsService {
  private readonly logger = new Logger('RecordsService');

  constructor(
    @InjectRepository(RecordRepository)
    private recordRepository: RecordRepository,
  ) {}

  getRecords(
    getRecordsFilterDto: GetRecordsFilterDto,
    systemUser: SystemUser,
  ): Promise<Record[]> {
    return this.recordRepository.getRecords(getRecordsFilterDto, systemUser);
  }

  async createRecord(
    createRecordDto: CreateRecordDto,
    author: Author,
    systemUser: SystemUser,
    req: Request,
  ): Promise<Record> {
    return await this.recordRepository.createRecord(
      createRecordDto,
      author,
      systemUser,
      req,
    );
  }

  async getRecordById(id: number, systemUser: SystemUser): Promise<Record> {
    const found = await this.recordRepository.findOne({
      where: { id, systemUserId: systemUser.id },
    });

    if (!found) {
      this.logger.verbose(`Record with ID ${id} not found`);
      throw new NotFoundException(`Record with ID ${id} not found`);
    }

    this.logger.verbose(`Record with ID ${id} successfuly found`);
    return found;
  }

  async deleteRecord(id: number, systemUser: SystemUser): Promise<void> {
    if (systemUser.role !== SystemUserRole.SUPER_ADMIN) {
      this.logger.verbose(
        `User ${systemUser.username} trying to delete record id: ${id}`,
      );
      throw new NotFoundException();
    }

    const result: DeleteResult = await this.recordRepository.delete({
      id,
      systemUserId: systemUser.id,
    });

    if (result && result.affected === 0) {
      this.logger.verbose(`Record with ID ${id} not found`);
      throw new NotFoundException(`Record with ID ${id} not found`);
    } else {
      this.logger.verbose(`Record with ID ${id} successfuly deleted`);
    }
  }

  async updateRecord(
    id: number,
    updateRecordDto: UpdateRecordDto,
    systemUser: SystemUser,
  ): Promise<Record> {
    const { status, type } = updateRecordDto;

    const record: Record = await this.getRecordById(id, systemUser);

    if (!status && !type) {
      this.logger.verbose('No properties to updete are declareted');
      throw new BadRequestException('No properties to updete are declareted');
    }
    if (status) {
      record.status = status;
    }
    if (type) {
      record.type = type;
    }

    record.lastUpdateDate = new Date();

    try {
      await record.save();
      this.logger.verbose(
        `Record with ID ${id} successfuly updated with new data ${JSON.stringify(
          updateRecordDto,
        )}`,
      );
      return record;
    } catch (error) {
      this.logger.error(
        `Failed on update record with id: ${id}; sended data was: ${JSON.stringify(
          UpdateRecordDto,
        )}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
