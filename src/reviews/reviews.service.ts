import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { SystemUser } from '../system-user/system-user.entity';
import { ReviewRepository } from './review.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Author } from '../authors/author.entity';
import { Request } from 'express';
import { Review } from './review.entity';
import { SystemUserRole } from '../system-user/system-user-role.enum';
import { DeleteResult } from 'typeorm';
import { GetReviewsFilterDto } from './dto/get-reviews-filter.dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger('ReviewsService');

  constructor(
    @InjectRepository(ReviewRepository)
    private reviewRepository: ReviewRepository,
  ) {}

  async createReview(
    createReviewDto: CreateReviewDto,
    author: Author,
    systemUser: SystemUser,
    req: Request,
  ): Promise<Review> {
    return await this.reviewRepository.createReview(
      createReviewDto,
      author,
      systemUser,
      req,
    );
  }

  getReviews(
    getReviewsFilterDto: GetReviewsFilterDto,
    systemUser: SystemUser,
  ): Promise<Review[]> {
    return this.reviewRepository.getReviews(getReviewsFilterDto, systemUser);
  }

  async getReviewById(id: number, systemUser: SystemUser): Promise<Review> {
    let found: Review;

    if (systemUser.role !== SystemUserRole.SUPER_ADMIN) {
      found = await this.reviewRepository.findOne({
        where: { id, systemUserId: systemUser.id },
      });
    } else {
      found = await this.reviewRepository.findOne({
        where: { id },
      });
    }
    if (!found) {
      this.logger.verbose(`Review with id ${id} does not exist`);
      throw new NotFoundException(`Review with id ${id} does not exist`);
    }

    this.logger.verbose(`Review with id ${id} successfully foud`);
    return found;
  }

  async deleteReview(id: number, systemUser: SystemUser): Promise<void> {
    if (systemUser.role !== SystemUserRole.SUPER_ADMIN) {
      this.logger.verbose(
        `SytemUser "${systemUser.username}" has no access to delete reviews`,
      );
      throw new NotFoundException();
    }
    const result: DeleteResult = await this.reviewRepository.delete({
      id,
    });

    if (result && result.affected === 0) {
      this.logger.verbose(`Review with ID ${id} not found`);
      throw new NotFoundException(`Review with ID ${id} not found`);
    } else {
      this.logger.verbose(`Review with ID ${id} successfully deleted`);
    }
  }
}
