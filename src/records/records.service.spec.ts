import { RecordsService } from './records.service';
import { RecordRepository } from './record.repository';
import { Test } from '@nestjs/testing';
import { SystemUser } from '../auth/system-user.entity';
import { GetRecordsFilterDto } from './dto/get-records-filter.dto';
import { RecordStatus } from './record-status.enum';
import { RecordType } from './record-type.enum';
import { CreateRecordDto } from './dto/create-rcord.dto';
import { Creator } from '../creators/creator.entity';
import { Request } from 'express';
import { Record } from './record.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SystemUserRole } from '../auth/system-user-role.enum';
import { UpdateRecordDto } from './dto/update-record.dto';

describe('RecordsService', () => {
  let recordsService: RecordsService;
  let recordRepository;

  const mockRecordRepository = () => ({
    getRecords: jest.fn(),
    createRecord: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  });

  const mockRecord = new Record();
  mockRecord.id = 10;
  mockRecord.title = 'TestTitle';
  mockRecord.description = 'TestDesc';
  mockRecord.save = jest.fn();

  const mockSystemUser = new SystemUser();
  mockSystemUser.id = 1;
  mockSystemUser.username = 'TestUsername';
  mockSystemUser.role = SystemUserRole.API_USER;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RecordsService,
        { provide: RecordRepository, useFactory: mockRecordRepository },
      ],
    }).compile();

    recordsService = await module.get<RecordsService>(RecordsService);
    recordRepository = await module.get<RecordRepository>(RecordRepository);
  });

  describe('getRecords', () => {
    it('Should call recordRepository.getRecords', async () => {
      recordRepository.getRecords.mockResolvedValue(mockRecord);

      const mockRecordsFilterDto = new GetRecordsFilterDto();
      mockRecordsFilterDto.status = RecordStatus.NEW;
      mockRecordsFilterDto.type = RecordType.MISPRINT;
      mockRecordsFilterDto.creatorId = 12;
      mockRecordsFilterDto.searchQuery = 'testSearchQuery';

      const result = await recordsService.getRecords(
        mockRecordsFilterDto,
        mockSystemUser,
        1,
      );
      expect(recordRepository.getRecords).toHaveBeenCalledWith(
        mockRecordsFilterDto,
        mockSystemUser,
        1,
      );
      expect(result).toEqual(mockRecord);
    });
  });

  describe('createRecord', () => {
    it('Should call recordRepository.getRecords', async () => {
      recordRepository.createRecord.mockResolvedValue(mockRecord);

      const mockCreateRecordDto = new CreateRecordDto();
      mockCreateRecordDto.title = 'TestRecord';
      mockCreateRecordDto.description = 'TestDesc';
      mockCreateRecordDto.type = RecordType.ADVERTISEMENT;

      const mockCrerator = new Creator();
      mockCrerator.id = 12;

      const mockReq = ({
        connection: { remoteAddress: '::1' },
        get: jest.fn(),
      } as unknown) as Request;

      const result = await recordsService.createRecord(
        mockCreateRecordDto,
        mockCrerator,
        mockSystemUser,
        mockReq,
      );
      expect(recordRepository.createRecord).toHaveBeenCalledWith(
        mockCreateRecordDto,
        mockCrerator,
        mockSystemUser,
        mockReq,
      );
      expect(result).toEqual(mockRecord);
    });
  });

  describe('getRecordById', () => {
    it('Should call recordRepository.findOne and returns a record', async () => {
      recordRepository.findOne.mockResolvedValue(mockRecord);

      const result = await recordsService.getRecordById(1, mockSystemUser);
      expect(recordRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, systemUserId: mockSystemUser.id },
      });
      expect(result).toEqual(mockRecord);
    });

    it('Should call recordRepository.findOne and returns NotFoundException', async () => {
      recordRepository.findOne.mockResolvedValue(null);

      expect(recordsService.getRecordById(1, mockSystemUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteRecord', () => {
    it('Should call recordRepository.delete and successfully delete a record', async () => {
      mockSystemUser.role = SystemUserRole.SUPER_ADMIN;

      recordRepository.delete.mockResolvedValue({ affected: 1 });
      await recordsService.deleteRecord(1, mockSystemUser);
      expect(recordRepository.delete).toHaveBeenCalledWith({
        id: 1,
        systemUserId: mockSystemUser.id,
      });
    });

    it('Should call recordRepository.delete and returs NotFoundException', () => {
      mockSystemUser.role = SystemUserRole.SUPER_ADMIN;
      recordRepository.delete.mockResolvedValue({ affected: 0 });

      expect(recordsService.deleteRecord(1, mockSystemUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Should return NotFoundError if user is not a super_admin', async () => {
      mockSystemUser.role = SystemUserRole.API_USER;
      expect(recordsService.deleteRecord(1, mockSystemUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Update record', () => {
    it('Should successfully update record', async () => {
      const mockUpdateRecordDto = new UpdateRecordDto();
      mockUpdateRecordDto.status = RecordStatus.SKIPPED;
      mockUpdateRecordDto.type = RecordType.LIKES;

      spyOn(recordsService, 'getRecordById').and.returnValue(mockRecord);

      const result = await recordsService.updateRecord(
        12,
        mockUpdateRecordDto,
        mockSystemUser,
      );

      expect(recordsService.getRecordById).toHaveBeenCalledWith(
        12,
        mockSystemUser,
      );

      expect(mockRecord.save).toHaveBeenCalled();

      expect(result).toEqual(mockRecord);
    });

    it('Should returns BadRequestException with recived empty Dto', () => {
      const emptyUpdateRecordDto = new UpdateRecordDto();

      spyOn(recordsService, 'getRecordById').and.returnValue(mockRecord);

      expect(
        recordsService.updateRecord(12, emptyUpdateRecordDto, mockSystemUser),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
