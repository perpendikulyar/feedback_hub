import { EntityRepository, Repository } from 'typeorm';
import { Problem } from './problem.entity';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateProblemDto } from './dto/create-problem.dto';
import { Author } from '../authors/author.entity';
import {
  GetProblemsFilterDto,
  ProblemSortBy,
} from './dto/get-problems-filter.dto';
import { SystemUser } from '../system-user/system-user.entity';
import { Request } from 'express';
import { SystemUserRole } from '../system-user/system-user-role.enum';
import { SortOrder } from '../utility/sortOrder.enum';
import { ENTRIES_PER_PAGE } from '../utility/constants';

@EntityRepository(Problem)
export class ProblemRepository extends Repository<Problem> {
  private readonly logger = new Logger('ProblemRepository');

  async getProblems(
    getProblemsFilterDto: GetProblemsFilterDto,
    systemUser: SystemUser,
  ): Promise<Problem[]> {
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
    } = getProblemsFilterDto;

    const query = this.createQueryBuilder('problem');

    if (systemUser.role !== SystemUserRole.SUPER_ADMIN) {
      query.andWhere('problem.systemUserId = :systemUserId', {
        systemUserId: systemUser.id,
      });
    }

    if (status) {
      query.andWhere('problem.status = :status', { status });
    }

    if (authorId) {
      query.andWhere('problem.authorId = :authorId', { authorId });
    }

    if (type) {
      query.andWhere('problem.type = :type', { type });
    }

    if (searchQuery) {
      query.andWhere(
        'problem.title LIKE :searchQuery OR problem.description LIKE :searchQuery',
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
        'problem.creationDate >= :fromDate AND problem.creationDate <= :tillDate',
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
        'problem.lastUpdateDate >= :fromDate AND problem.lastUpdateDate <= :tillDate',
        {
          fromDate,
          tillDate,
        },
      );
    }

    query.take((page ? page : 1) * ENTRIES_PER_PAGE);

    query.skip((page ? page : 1) * ENTRIES_PER_PAGE - ENTRIES_PER_PAGE);

    try {
      const problems: Problem[] = await query
        .orderBy(
          sortBy ? sortBy : ProblemSortBy.ID,
          sortOrder ? sortOrder : SortOrder.DESC,
        )
        .getMany();
      this.logger.verbose(`Problems successfully served`);

      return problems;
    } catch (error) {
      this.logger.error('Failed on getting all problems', error.stack);
      throw new InternalServerErrorException();
    }
  }

  async createProblem(
    createProblemDto: CreateProblemDto,
    author: Author,
    systemUser: SystemUser,
    req: Request,
  ): Promise<Problem> {
    const { title, description, type } = createProblemDto;

    const problem = this.create();
    problem.title = title;
    problem.description = description;
    problem.type = type;
    problem.author = author;
    problem.systemUser = systemUser;
    problem.authorIp = req.connection.remoteAddress;
    problem.authorUserAgent = req.get('User-Agent');

    try {
      await problem.save();

      delete problem.author;
      delete problem.systemUser;

      this.logger.verbose(
        `New problem successfuly created by autor: ${JSON.stringify(author)}`,
      );
      return problem;
    } catch (error) {
      this.logger.error(
        `Failed on creting new problem with data: ${JSON.stringify(
          createProblemDto,
        )}; and autor: ${JSON.stringify(author)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
