import { EntityRepository, Repository } from 'typeorm';
import { Record } from './record.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { CreateRecordDto } from './dto/create-rcord.dto';
import { RecordStatus } from './record-status.enum';
import { Creator } from '../creators/creator.entity';
import { GetRecordsFilterDto } from './dto/get-tasks-filter.dto';
import { SystemUser } from '../auth/system-user.entity';

@EntityRepository(Record)
export class RecordRepository extends Repository<Record> {
  async getRecords(
    getRecordsFilterDto: GetRecordsFilterDto,
    systemUser: SystemUser,
  ): Promise<Record[]> {
    const {
      status,
      creatorId,
      searchQuery,
      type,
      startDate,
      endDate,
    } = getRecordsFilterDto;

    const query = this.createQueryBuilder('record');

    query.where('record.systemUserId = :systemUserId', {
      systemUserId: systemUser.id,
    });

    if (status) {
      query.andWhere('record.status = :status', { status });
    }

    if (creatorId) {
      query.andWhere('record.creatorId = :creatorId', { creatorId });
    }

    if (type) {
      query.andWhere('record.type = :type', { type });
    }

    if (searchQuery) {
      query.andWhere(
        'record.title LIKE :searchQuery OR record.description LIKE :searchQuery',
        { searchQuery: `%${searchQuery}%` },
      );
    }

    // @todo make period filter

    try {
      const records: Record[] = await query.getMany();

      return records;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async createRecord(
    createRecordDto: CreateRecordDto,
    creator: Creator,
    systemUser: SystemUser,
  ): Promise<Record> {
    const { title, description, type } = createRecordDto;

    const record = new Record();
    record.title = title;
    record.description = description;
    record.status = RecordStatus.NEW;
    record.creationDate = new Date();
    record.lastUpdatedDate = new Date();
    record.type = type;
    record.creator = creator;
    record.systemUser = systemUser;

    try {
      await record.save();

      delete record.creator;
      delete record.systemUser;
      return record;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
