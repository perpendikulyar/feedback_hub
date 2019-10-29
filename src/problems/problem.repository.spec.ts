import { SystemUser } from '../system-user/system-user.entity';
import { Author } from '../authors/author.entity';
import { Problem } from './problem.entity';
import { CreateProblemDto } from './dto/create-problem.dto';
import { ProblemType } from './problem-type.enum';
import { Test } from '@nestjs/testing';
import { ProblemRepository } from './problem.repository';
import { GetProblemsFilterDto } from './dto/get-problems-filter.dto';
import { ProblemStatus } from './problem-status.enum';

describe('ProblemRepository', () => {
  let problemRepository;

  const mockAuthor = new Author();
  mockAuthor.id = 1;

  const mockSystemUser = new SystemUser();
  mockSystemUser.id = 1;
  mockSystemUser.username = 'testName';

  const mockProblem = new Problem();
  mockProblem.id = 1;
  mockProblem.title = 'TestProblem';
  mockProblem.description = 'TestDesc';

  const mockCreateProblemDto = new CreateProblemDto();
  mockCreateProblemDto.title = 'TestProblem';
  mockCreateProblemDto.description = 'TestDesc';
  mockCreateProblemDto.type = ProblemType.ADVERTISEMENT;

  const mockReq = ({
    connection: { remoteAddress: '::1' },
    get: jest.fn(),
  } as unknown) as Request;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ProblemRepository],
    }).compile();

    problemRepository = await module.get<ProblemRepository>(ProblemRepository);
  });

  describe('createProblem', () => {
    let save;

    beforeEach(() => {
      save = jest.fn();
      problemRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('Successfully created new problem', async () => {
      save.mockResolvedValue(mockProblem);

      spyOn(problemRepository, 'createProblem').and.returnValue(mockProblem);

      const result = await problemRepository.createProblem(
        mockCreateProblemDto,
        mockAuthor,
        mockSystemUser,
        mockReq,
      );

      expect(result).toEqual(mockProblem);
    });
  });

  describe('getProblems', () => {
    it('Successfully returns problems with query', async () => {
      const mockGetProblemsFilterDto = new GetProblemsFilterDto();
      mockGetProblemsFilterDto.status = ProblemStatus.RESOLVED;

      spyOn(problemRepository, 'getProblems').and.returnValue([
        mockProblem,
        mockProblem,
      ]);

      const result = await problemRepository.getProblems(
        mockGetProblemsFilterDto,
        mockSystemUser,
      );

      expect(result).toEqual([mockProblem, mockProblem]);
    });
  });
});
