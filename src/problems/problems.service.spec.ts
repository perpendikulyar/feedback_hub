import { ProblemsService } from './problems.service';
import { ProblemRepository } from './problem.repository';
import { Test } from '@nestjs/testing';
import { SystemUser } from '../system-user/system-user.entity';
import { GetProblemsFilterDto } from './dto/get-problems-filter.dto';
import { ProblemStatus } from './problem-status.enum';
import { ProblemType } from './problem-type.enum';
import { CreateProblemDto } from './dto/create-problem.dto';
import { Author } from '../authors/author.entity';
import { Request } from 'express';
import { Problem } from './problem.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SystemUserRole } from '../system-user/system-user-role.enum';
import { UpdateProblemDto } from './dto/update-problem.dto';

describe('ProblemsService', () => {
  let problemsService: ProblemsService;
  let problemRepository;

  const mockProblemRepository = () => ({
    getProblems: jest.fn(),
    createProblem: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  });

  const mockProblem = new Problem();
  mockProblem.id = 10;
  mockProblem.title = 'TestTitle';
  mockProblem.description = 'TestDesc';
  mockProblem.save = jest.fn();

  const mockSystemUser = new SystemUser();
  mockSystemUser.id = 1;
  mockSystemUser.username = 'TestUsername';
  mockSystemUser.role = SystemUserRole.API_USER;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProblemsService,
        { provide: ProblemRepository, useFactory: mockProblemRepository },
      ],
    }).compile();

    problemsService = await module.get<ProblemsService>(ProblemsService);
    problemRepository = await module.get<ProblemRepository>(ProblemRepository);
  });

  describe('getProblems', () => {
    it('Should call problemRepository.getProblems', async () => {
      problemRepository.getProblems.mockResolvedValue(mockProblem);

      const mockProblemsFilterDto = new GetProblemsFilterDto();
      mockProblemsFilterDto.status = ProblemStatus.NEW;
      mockProblemsFilterDto.type = ProblemType.MISPRINT;
      mockProblemsFilterDto.authorId = 12;
      mockProblemsFilterDto.searchQuery = 'testSearchQuery';

      const result = await problemsService.getProblems(
        mockProblemsFilterDto,
        mockSystemUser,
      );
      expect(problemRepository.getProblems).toHaveBeenCalledWith(
        mockProblemsFilterDto,
        mockSystemUser,
      );
      expect(result).toEqual(mockProblem);
    });
  });

  describe('createProblem', () => {
    it('Should call problemRepository.createProblem', async () => {
      problemRepository.createProblem.mockResolvedValue(mockProblem);

      const mockCreateProblemDto = new CreateProblemDto();
      mockCreateProblemDto.title = 'TestProblem';
      mockCreateProblemDto.description = 'TestDesc';
      mockCreateProblemDto.type = ProblemType.ADVERTISEMENT;

      const mockAuthor = new Author();
      mockAuthor.id = 12;

      const mockReq = ({
        connection: { remoteAddress: '::1' },
        get: jest.fn(),
      } as unknown) as Request;

      const result = await problemsService.createProblem(
        mockCreateProblemDto,
        mockAuthor,
        mockSystemUser,
        mockReq,
      );
      expect(problemRepository.createProblem).toHaveBeenCalledWith(
        mockCreateProblemDto,
        mockAuthor,
        mockSystemUser,
        mockReq,
      );
      expect(result).toEqual(mockProblem);
    });
  });

  describe('getProblemById', () => {
    it('Should call problemRepository.findOne and returns a problem', async () => {
      problemRepository.findOne.mockResolvedValue(mockProblem);

      const result = await problemsService.getProblemById(1, mockSystemUser);
      expect(problemRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, systemUserId: mockSystemUser.id },
      });
      expect(result).toEqual(mockProblem);
    });

    it('Should call problemRepository.findOne and returns NotFoundException', async () => {
      problemRepository.findOne.mockResolvedValue(null);

      expect(problemsService.getProblemById(1, mockSystemUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteProblem', () => {
    it('Should call problemRepository.delete and successfully delete a problem', async () => {
      mockSystemUser.role = SystemUserRole.SUPER_ADMIN;

      problemRepository.delete.mockResolvedValue({ affected: 1 });
      await problemsService.deleteProblem(1, mockSystemUser);
      expect(problemRepository.delete).toHaveBeenCalledWith({
        id: 1,
        systemUserId: mockSystemUser.id,
      });
    });

    it('Should call problemRepository.delete and returs NotFoundException', () => {
      mockSystemUser.role = SystemUserRole.SUPER_ADMIN;
      problemRepository.delete.mockResolvedValue({ affected: 0 });

      expect(problemsService.deleteProblem(1, mockSystemUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Should return NotFoundError if user is not a super_admin', async () => {
      mockSystemUser.role = SystemUserRole.API_USER;
      expect(problemsService.deleteProblem(1, mockSystemUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Update problem', () => {
    it('Should successfully update problem', async () => {
      const mockUpdateProblemDto = new UpdateProblemDto();
      mockUpdateProblemDto.status = ProblemStatus.SKIPPED;
      mockUpdateProblemDto.type = ProblemType.LIKES;

      spyOn(problemsService, 'getProblemById').and.returnValue(mockProblem);

      const result = await problemsService.updateProblem(
        12,
        mockUpdateProblemDto,
        mockSystemUser,
      );

      expect(problemsService.getProblemById).toHaveBeenCalledWith(
        12,
        mockSystemUser,
      );

      expect(mockProblem.save).toHaveBeenCalled();

      expect(result).toEqual(mockProblem);
    });

    it('Should returns BadRequestException with recived empty Dto', () => {
      const emptyUpdateProblemDto = new UpdateProblemDto();

      spyOn(problemsService, 'getProblemById').and.returnValue(mockProblem);

      expect(
        problemsService.updateProblem(
          12,
          emptyUpdateProblemDto,
          mockSystemUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
