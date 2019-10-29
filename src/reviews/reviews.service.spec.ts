import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { ReviewRepository } from './review.repository';
import { SystemUser } from '../system-user/system-user.entity';
import { SystemUserRole } from '../system-user/system-user-role.enum';
import { Review } from './review.entity';
import { GetReviewsFilterDto } from './dto/get-reviews-filter.dto';
import { NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { Author } from '../authors/author.entity';
import { Request } from 'express';
import { async } from 'rxjs/internal/scheduler/async';

describe('ReviewsService', () => {
  let reviewsService: ReviewsService;
  let reviewRepository;

  const mockReviewRepository = () => ({
    getReviews: jest.fn(),
    createReview: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  });

  const mockSystemUser = new SystemUser();
  mockSystemUser.id = 1;
  mockSystemUser.username = 'TestUsername';

  const mockReview = new Review();
  mockReview.id = 1;
  mockReview.text = 'test test';
  mockReview.rating = 5;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: ReviewRepository, useFactory: mockReviewRepository },
      ],
    }).compile();

    reviewsService = module.get<ReviewsService>(ReviewsService);
    reviewRepository = module.get<ReviewRepository>(ReviewRepository);
    mockSystemUser.role = SystemUserRole.API_USER;
  });

  describe('getReviews', () => {
    const mockGetReviewsFilterDto = new GetReviewsFilterDto();
    mockGetReviewsFilterDto.authorId = 1;

    it('Should call reviewRepository and return array of reviews', async () => {
      reviewRepository.getReviews.mockResolvedValue([mockReview]);

      const result = await reviewsService.getReviews(
        mockGetReviewsFilterDto,
        mockSystemUser,
      );
      expect(reviewRepository.getReviews).toHaveBeenCalledWith(
        mockGetReviewsFilterDto,
        mockSystemUser,
      );
      expect(result).toEqual([mockReview]);
    });
  });

  describe('getReviewById', () => {
    it('should call reviewRepository and return review to api system user', async () => {
      reviewRepository.findOne.mockResolvedValue(mockReview);

      const result = await reviewsService.getReviewById(1, mockSystemUser);
      expect(reviewRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, systemUserId: mockSystemUser.id },
      });
      expect(result).toEqual(mockReview);
    });
    it('should call reviewRepository and return review for super_admin system user', async () => {
      mockSystemUser.role = SystemUserRole.SUPER_ADMIN;
      reviewRepository.findOne.mockResolvedValue(mockReview);

      const result = await reviewsService.getReviewById(1, mockSystemUser);
      expect(reviewRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockReview);
    });
    it('should call reviewRepository and return not found as review does not exist', () => {
      reviewRepository.findOne.mockResolvedValue(null);

      const result = reviewsService.getReviewById(1, mockSystemUser);
      expect(reviewRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, systemUserId: mockSystemUser.id },
      });
      expect(result).rejects.toThrow(NotFoundException);
    });
  });

  describe('createReview', () => {
    const mockCreateReviewDto = new CreateReviewDto();
    mockCreateReviewDto.text = 'test text';
    mockCreateReviewDto.rating = 5;

    const mockAuthor = new Author();
    mockAuthor.id = 24;

    const mockReq = ({
      connection: { remoteAddress: '::1' },
      get: jest.fn(),
    } as unknown) as Request;

    it('Should call reviewRepository and successfully create new review', async () => {
      reviewRepository.createReview.mockResolvedValue(mockReview);

      const result = await reviewsService.createReview(
        mockCreateReviewDto,
        mockAuthor,
        mockSystemUser,
        mockReq,
      );

      expect(reviewRepository.createReview).toHaveBeenCalledWith(
        mockCreateReviewDto,
        mockAuthor,
        mockSystemUser,
        mockReq,
      );
      expect(result).toEqual(mockReview);
    });
  });

  describe('deleteReview', () => {
    it('Should return NotFound as system user is not super_admin', () => {
      const result = reviewsService.deleteReview(24, mockSystemUser);
      expect(reviewRepository.delete).not.toHaveBeenCalled();
      expect(result).rejects.toThrow(NotFoundException);
    });
    it('Should return NotFound as review is not exist', () => {
      mockSystemUser.role = SystemUserRole.SUPER_ADMIN;
      reviewRepository.delete.mockResolvedValue({ affected: 0 });
      const result = reviewsService.deleteReview(24, mockSystemUser);
      expect(reviewRepository.delete).toHaveBeenCalledWith({
        id: 24,
      });
      expect(result).rejects.toThrow(NotFoundException);
    });
    it('Should successfully delete a review', async () => {
      mockSystemUser.role = SystemUserRole.SUPER_ADMIN;
      reviewRepository.delete.mockResolvedValue({ affected: 1 });
      await reviewsService.deleteReview(24, mockSystemUser);
      expect(reviewRepository.delete).toHaveBeenCalledWith({
        id: 24,
      });
    });
  });
});
