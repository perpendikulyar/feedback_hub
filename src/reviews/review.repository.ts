import { EntityRepository, Repository } from 'typeorm';
import { Review } from './review.entity';
import { Logger, InternalServerErrorException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { SystemUser } from '../system-user/system-user.entity';
import { Author } from '../authors/author.entity';
import { Request } from 'express';
import {
  GetReviewsFilterDto,
  ReviewSortBy,
} from './dto/get-reviews-filter.dto';
import { SystemUserRole } from '../system-user/system-user-role.enum';
import { ENTRIES_PER_PAGE } from '../utility/constants';
import { SortOrder } from '../utility/sortOrder.enum';

@EntityRepository(Review)
export class ReviewRepository extends Repository<Review> {
  private readonly logger = new Logger('ReviewRepository');

  async createReview(
    createReviewDto: CreateReviewDto,
    author: Author,
    systemUser: SystemUser,
    req: Request,
  ): Promise<Review> {
    const { text, rating, category } = createReviewDto;

    const review = new Review();
    review.text = text;
    review.systemUser = systemUser;
    review.author = author;
    if (rating) {
      review.rating = rating;
    }
    if (category) {
      review.category = category;
    }
    review.authorIp = req.connection.remoteAddress;
    review.authorUserAgent = req.get('User-Agent');

    try {
      await review.save();

      delete review.author;
      delete review.systemUser;
      this.logger.verbose('New review successfully created');

      return review;
    } catch (error) {
      this.logger.error(
        `Failed on creating new review with data: ${JSON.stringify(
          createReviewDto,
        )}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async getReviews(
    getReviewsFilterDto: GetReviewsFilterDto,
    systemUser: SystemUser,
  ): Promise<Review[]> {
    const {
      category,
      rating,
      authorId,
      searchQuery,
      creationEndDate,
      creationStartDate,
      page,
      sortBy,
      sortOrder,
    } = getReviewsFilterDto;

    const query = this.createQueryBuilder('review');

    if (systemUser.role !== SystemUserRole.SUPER_ADMIN) {
      query.andWhere('review.systemUserId = :systemUserId', {
        systemUserId: systemUser.id,
      });
    }
    if (rating) {
      query.andWhere('review.rating = :rating', { rating });
    }
    if (category) {
      query.andWhere('review.category = :category', { category });
    }
    if (authorId) {
      query.andWhere('review.authorId = :authorId', { authorId });
    }
    if (searchQuery) {
      query.andWhere('review.text like = :searchQuery', {
        searchQuery: `%${searchQuery}%`,
      });
    }
    if (
      (creationStartDate && creationEndDate) ||
      creationStartDate ||
      creationEndDate
    ) {
      const fromDate = creationStartDate ? creationStartDate : new Date(0);
      const tillDate = creationEndDate ? creationEndDate : new Date();
      query.andWhere(
        'review.creationDate >= :fromDate AND review.creationDate <= :tillDate',
        {
          fromDate,
          tillDate,
        },
      );
    }
    query.take((page ? page : 1) * ENTRIES_PER_PAGE);
    query.skip((page ? page : 1) * ENTRIES_PER_PAGE - ENTRIES_PER_PAGE);

    try {
      const reviews: Review[] = await query
        .orderBy(
          sortBy ? sortBy : ReviewSortBy.ID,
          sortOrder ? sortOrder : SortOrder.DESC,
        )
        .getMany();

      this.logger.verbose('Reviews successfully served');
      return reviews;
    } catch (error) {
      this.logger.error(
        `Failed on fetching reviews with filters ${JSON.stringify(
          getReviewsFilterDto,
        )}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
