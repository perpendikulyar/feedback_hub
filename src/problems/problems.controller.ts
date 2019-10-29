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
import { ProblemsService } from './problems.service';
import { Problem } from './problem.entity';
import { CreateProblemDto } from './dto/create-problem.dto';
import { AuthorHashValidationPipe } from '../authors/pipes/author-hash-validation.pipe';
import { GetProblemsFilterDto } from './dto/get-problems-filter.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { GetSystemUser } from '../system-user/get-system-user.decorator';
import { SystemUser } from '../system-user/system-user.entity';
import { AuthGuard } from '@nestjs/passport';
import { Logger } from '@nestjs/common';
import { AutorsService } from '../authors/authors.service';
import { Author } from '../authors/author.entity';

@Controller('problems')
@UseGuards(AuthGuard())
export class ProblemsController {
  private readonly logger = new Logger('ProblemsController');

  constructor(
    private problemsService: ProblemsService,
    private authorsService: AutorsService,
  ) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createProblem(
    @Body() createProblemDto: CreateProblemDto,
    @Body('authorHash', AuthorHashValidationPipe) authorHash: string,
    @GetSystemUser() systemUser: SystemUser,
    @Req() req: Request,
  ): Promise<Problem> {
    this.logger.verbose(
      `User "${
        systemUser.username
      }" trying to create new problem with data: ${JSON.stringify(
        createProblemDto,
      )}; and author hash: ${authorHash}`,
    );

    const author: Author = await this.authorsService.mergeAuthor(
      authorHash,
      systemUser,
    );

    return this.problemsService.createProblem(
      createProblemDto,
      author,
      systemUser,
      req,
    );
  }

  @Get()
  getProblems(
    @Query(ValidationPipe) getProblemsFilterDto: GetProblemsFilterDto,
    @GetSystemUser() systemUser: SystemUser,
  ): Promise<Problem[]> {
    this.logger.verbose(
      `User "${
        systemUser.username
      }" trying to get problems with filters: ${JSON.stringify(
        getProblemsFilterDto,
      )}`,
    );
    return this.problemsService.getProblems(getProblemsFilterDto, systemUser);
  }

  @Get('/:id')
  getProblemById(
    @Param('id', ParseIntPipe) id: number,
    @GetSystemUser() systemUser: SystemUser,
  ): Promise<Problem> {
    this.logger.verbose(
      `User "${systemUser.username}" trying to get problem with id: ${id}`,
    );
    return this.problemsService.getProblemById(id, systemUser);
  }

  @Patch('/:id')
  updateProblem(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateProblemDto: UpdateProblemDto,
    @GetSystemUser() systemUser: SystemUser,
  ): Promise<Problem> {
    this.logger.verbose(
      `User "${
        systemUser.username
      }" trying to update problem with id: ${id}; new data: ${JSON.stringify(
        updateProblemDto,
      )}`,
    );
    return this.problemsService.updateProblem(id, updateProblemDto, systemUser);
  }

  @Delete('/:id')
  deleteProblem(
    @Param('id', ParseIntPipe) id: number,
    @GetSystemUser() systemUser: SystemUser,
  ): Promise<void> {
    this.logger.verbose(
      `User "${systemUser.username}" trying to delete problem with id: ${id}`,
    );
    return this.problemsService.deleteProblem(id, systemUser);
  }
}
