import { Author } from '../authors/author.entity';
import { SystemUser } from '../system-user/system-user.entity';
import { SystemUserRole } from '../system-user/system-user-role.enum';
import { Review } from './review.entity';
import { Test } from '@nestjs/testing';
import { ReviewRepository } from './review.repository';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsFilterDto } from './dto/get-reviews-filter.dto';
import { Request } from 'express';

describe('ReviewsRepository', () => {
  let reviewsRepository;

  const mockAuthor = new Author();
  mockAuthor.id = 10;
  mockAuthor.authorHash = 'testHash';

  const mockSystemUser = new SystemUser();
  mockSystemUser.id = 1;
  mockSystemUser.username = 'testUsername';

  const mockReview = new Review();
  mockReview.id = 24;
  mockReview.text = 'test text';
  mockReview.rating = 5;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ReviewRepository],
    }).compile();

    reviewsRepository = await module.get<ReviewRepository>(ReviewRepository);

    mockSystemUser.role = SystemUserRole.SUPER_ADMIN;
  });

  describe('createReview', () => {
    let save;

    const mockReq = ({
      connection: { remoteAddress: '::1' },
      get: jest.fn(),
    } as unknown) as Request;

    const mockCreateReviewDto = new CreateReviewDto();
    mockCreateReviewDto.text = 'test text';
    mockCreateReviewDto.rating = 5;

    beforeEach(() => {
      save = jest.fn();
      reviewsRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('Successfully created a new review', async () => {
      save.mockResolvedValue(mockReview);

      spyOn(reviewsRepository, 'createReview').and.returnValue(mockReview);

      const result = await reviewsRepository.createReview(
        mockCreateReviewDto,
        mockAuthor,
        mockSystemUser,
        mockReq,
      );

      expect(result).toEqual(mockReview);
    });
  });

  describe('GetReviews', () => {
    it('Succsessfully returns array of reviews with filters', async () => {
      const mockGetReviewsFilterDto = new GetReviewsFilterDto();
      mockGetReviewsFilterDto.authorId = 1;

      spyOn(reviewsRepository, 'getReviews').and.returnValue([mockReview]);

      const result = await reviewsRepository.getReviews(
        mockGetReviewsFilterDto,
        mockSystemUser,
      );
      expect(result).toEqual([mockReview]);
    });
  });
});
