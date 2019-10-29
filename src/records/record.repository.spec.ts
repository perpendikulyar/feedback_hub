import { SystemUser } from '../system-user/system-user.entity';
import { Author } from '../authors/author.entity';
import { Record } from './record.entity';
import { CreateRecordDto } from './dto/create-rcord.dto';
import { RecordType } from './record-type.enum';
import { Test } from '@nestjs/testing';
import { RecordRepository } from './record.repository';
import { GetRecordsFilterDto } from './dto/get-records-filter.dto';
import { RecordStatus } from './record-status.enum';

describe('RecordRepository', () => {
  let recordRepository;

  const mockAuthor = new Author();
  mockAuthor.id = 1;

  const mockSystemUser = new SystemUser();
  mockSystemUser.id = 1;
  mockSystemUser.username = 'testName';

  const mockRecord = new Record();
  mockRecord.id = 1;
  mockRecord.title = 'TestRecord';
  mockRecord.description = 'TestDesc';

  const mockCreateRecordDto = new CreateRecordDto();
  mockCreateRecordDto.title = 'TestRecord';
  mockCreateRecordDto.description = 'TestDesc';
  mockCreateRecordDto.type = RecordType.ADVERTISEMENT;

  const mockReq = ({
    connection: { remoteAddress: '::1' },
    get: jest.fn(),
  } as unknown) as Request;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [RecordRepository],
    }).compile();

    recordRepository = await module.get<RecordRepository>(RecordRepository);
  });

  describe('createRecord', () => {
    let save;

    beforeEach(() => {
      save = jest.fn();
      recordRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('Successfully created new record', async () => {
      save.mockResolvedValue(mockRecord);

      spyOn(recordRepository, 'createRecord').and.returnValue(mockRecord);

      const result = await recordRepository.createRecord(
        mockCreateRecordDto,
        mockAuthor,
        mockSystemUser,
        mockReq,
      );

      expect(result).toEqual(mockRecord);
    });
  });

  describe('getRecords', () => {
    it('Successfully returns records with query', async () => {
      const mockGetRecordsFilterDto = new GetRecordsFilterDto();
      mockGetRecordsFilterDto.status = RecordStatus.RESOLVED;

      spyOn(recordRepository, 'getRecords').and.returnValue([
        mockRecord,
        mockRecord,
      ]);

      const result = await recordRepository.getRecords(
        mockGetRecordsFilterDto,
        mockSystemUser,
      );

      expect(result).toEqual([mockRecord, mockRecord]);
    });
  });
});
