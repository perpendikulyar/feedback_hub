import { EntityRepository, Repository } from 'typeorm';
import { Record } from './record.entity';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateRecordDto } from './dto/create-rcord.dto';
import { Author } from '../authors/author.entity';
import {
  GetRecordsFilterDto,
  RecordsSortBy,
} from './dto/get-records-filter.dto';
import { SystemUser } from '../system-user/system-user.entity';
import { Request } from 'express';
import { SystemUserRole } from '../system-user/system-user-role.enum';
import { SortOrder } from '../utility/sortOrder.enum';

@EntityRepository(Record)
export class RecordRepository extends Repository<Record> {
  private readonly logger = new Logger('RecordRepository');

  async getRecords(
    getRecordsFilterDto: GetRecordsFilterDto,
    systemUser: SystemUser,
  ): Promise<Record[]> {
    const {
      status,
      authorId,
      searchQuery,
      type,
      creationStartDate,
      creationEndDate,
      updatedStartDate,
      updatedEndDate,
      page,
      sortBy,
      sortOrder,
    } = getRecordsFilterDto;

    const query = this.createQueryBuilder('record');

    if (systemUser.role !== SystemUserRole.SUPER_ADMIN) {
      query.andWhere('record.systemUserId = :systemUserId', {
        systemUserId: systemUser.id,
      });
    }

    if (status) {
      query.andWhere('record.status = :status', { status });
    }

    if (authorId) {
      query.andWhere('record.authorId = :authorId', { authorId });
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

    if (
      (creationStartDate && creationEndDate) ||
      creationStartDate ||
      creationEndDate
    ) {
      const fromDate = creationStartDate ? creationStartDate : new Date(0);
      const tillDate = creationEndDate ? creationEndDate : new Date();

      this.logger.debug(
        `Filtering cration date. from: ${fromDate}; till: ${tillDate}`,
      );
      query.andWhere(
        'record.creationDate >= :fromDate AND record.creationDate <= :tillDate',
        {
          fromDate,
          tillDate,
        },
      );
    }

    if (
      (updatedStartDate && creationEndDate) ||
      updatedStartDate ||
      updatedEndDate
    ) {
      const fromDate = updatedStartDate ? updatedStartDate : new Date(0);
      const tillDate = updatedEndDate ? updatedEndDate : new Date();

      this.logger.debug(
        `Filtering updated date. from: ${fromDate}; till: ${tillDate}`,
      );
      query.andWhere(
        'record.lastUpdateDate >= :fromDate AND record.lastUpdateDate <= :tillDate',
        {
          fromDate,
          tillDate,
        },
      );
    }

    const recordsPerPage = 10;

    query.take((page ? page : 1) * recordsPerPage);

    query.skip((page ? page : 1) * recordsPerPage - recordsPerPage);

    try {
      const records: Record[] = await query
        .orderBy(
          sortBy ? sortBy : RecordsSortBy.ID,
          sortOrder ? sortOrder : SortOrder.DESC,
        )
        .getMany();
      this.logger.verbose(`Records successfully served`);

      return records;
    } catch (error) {
      this.logger.error('Failed on getting all records', error.stack);
      throw new InternalServerErrorException();
    }
  }

  async createRecord(
    createRecordDto: CreateRecordDto,
    author: Author,
    systemUser: SystemUser,
    req: Request,
  ): Promise<Record> {
    const { title, description, type } = createRecordDto;

    const record = this.create();
    record.title = title;
    record.description = description;
    record.type = type;
    record.author = author;
    record.systemUser = systemUser;
    record.authorIp = req.connection.remoteAddress;
    record.authorUserAgent = req.get('User-Agent');

    try {
      await record.save();

      delete record.author;
      delete record.systemUser;

      this.logger.verbose(
        `New record successfuly created by autor: ${JSON.stringify(author)}`,
      );
      return record;
    } catch (error) {
      this.logger.error(
        `Failed on creting new record with data: ${JSON.stringify(
          createRecordDto,
        )}; and autor: ${JSON.stringify(author)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
