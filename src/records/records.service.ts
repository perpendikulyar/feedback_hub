import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecordRepository } from './record.repository';
import { Record } from './record.entity';
import { CreateRecordDto } from './dto/create-rcord.dto';
import { CreatorsService } from '../creators/creators.service';
import { Creator } from 'src/creators/creator.entity';
import { GetRecordsFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { SystemUser } from '../auth/system-user.entity';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(RecordRepository)
    private recordRepository: RecordRepository,
    private creatorsService: CreatorsService,
  ) {}

  getRecords(
    getRecordsFilterDto: GetRecordsFilterDto,
    systemUser: SystemUser,
  ): Promise<Record[]> {
    return this.recordRepository.getRecords(getRecordsFilterDto, systemUser);
  }

  async createRecord(
    createrecordDto: CreateRecordDto,
    userCookie: string,
    systemUser: SystemUser,
  ): Promise<Record> {
    const creator: Creator = await this.creatorsService.mergeCreator(
      userCookie,
    );
    return await this.recordRepository.createRecord(
      createrecordDto,
      creator,
      systemUser,
    );
  }

  async getRecordById(id: number, systemUser: SystemUser): Promise<Record> {
    const found = await this.recordRepository.findOne({
      where: { id, systemUserId: systemUser.id },
    });

    if (!found) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }

    return found;
  }

  async deleteRecord(id: number, systemUser: SystemUser): Promise<void> {
    const result = await this.recordRepository.delete({
      id,
      systemUserId: systemUser.id,
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Record with ID ${id} not found`);
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
      throw new BadRequestException('No properties to updete are declareted');
    }

    if (status) {
      record.status = status;
    }

    if (type) {
      record.type = type;
    }

    record.lastUpdatedDate = new Date();

    try {
      await record.save();
      return record;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}