import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProblemRepository } from './problem.repository';
import { Problem } from './problem.entity';
import { CreateProblemDto } from './dto/create-problem.dto';
import { Author } from '../authors/author.entity';
import { GetProblemsFilterDto } from './dto/get-problems-filter.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { SystemUser } from '../system-user/system-user.entity';
import { Request } from 'express';
import { SystemUserRole } from '../system-user/system-user-role.enum';
import { DeleteResult } from 'typeorm';

@Injectable()
export class ProblemsService {
  private readonly logger = new Logger('ProblemsService');

  constructor(
    @InjectRepository(ProblemRepository)
    private problemRepository: ProblemRepository,
  ) {}

  getProblems(
    getProblemsFilterDto: GetProblemsFilterDto,
    systemUser: SystemUser,
  ): Promise<Problem[]> {
    return this.problemRepository.getProblems(getProblemsFilterDto, systemUser);
  }

  async createProblem(
    createProblemDto: CreateProblemDto,
    author: Author,
    systemUser: SystemUser,
    req: Request,
  ): Promise<Problem> {
    return await this.problemRepository.createProblem(
      createProblemDto,
      author,
      systemUser,
      req,
    );
  }

  async getProblemById(id: number, systemUser: SystemUser): Promise<Problem> {
    const found = await this.problemRepository.findOne({
      where: { id, systemUserId: systemUser.id },
    });

    if (!found) {
      this.logger.verbose(`Problem with ID ${id} not found`);
      throw new NotFoundException(`Problem with ID ${id} not found`);
    }

    this.logger.verbose(`Problem with ID ${id} successfully found`);
    return found;
  }

  async deleteProblem(id: number, systemUser: SystemUser): Promise<void> {
    if (systemUser.role !== SystemUserRole.SUPER_ADMIN) {
      this.logger.verbose(
        `User ${systemUser.username} trying to delete problem id: ${id}`,
      );
      throw new NotFoundException();
    }

    const result: DeleteResult = await this.problemRepository.delete({
      id,
      systemUserId: systemUser.id,
    });

    if (result && result.affected === 0) {
      this.logger.verbose(`Problem with ID ${id} not found`);
      throw new NotFoundException(`Problem with ID ${id} not found`);
    } else {
      this.logger.verbose(`Problem with ID ${id} successfully deleted`);
    }
  }

  async updateProblem(
    id: number,
    updateProblemDto: UpdateProblemDto,
    systemUser: SystemUser,
  ): Promise<Problem> {
    const { status, type } = updateProblemDto;

    const problem: Problem = await this.getProblemById(id, systemUser);

    if (!status && !type) {
      this.logger.verbose('No properties to updete are declareted');
      throw new BadRequestException('No properties to updete are declareted');
    }
    if (status) {
      problem.status = status;
    }
    if (type) {
      problem.type = type;
    }

    try {
      await problem.save();
      this.logger.verbose(
        `Problem with ID ${id} successfully updated with new data ${JSON.stringify(
          updateProblemDto,
        )}`,
      );
      return problem;
    } catch (error) {
      this.logger.error(
        `Failed on update problem with id: ${id}; sended data was: ${JSON.stringify(
          updateProblemDto,
        )}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
