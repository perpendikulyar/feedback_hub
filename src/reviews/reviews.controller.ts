import {
  Controller,
  Get,
  Logger,
  Post,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Body,
  Req,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReviewsService } from './reviews.service';
import { AutorsService } from '../authors/authors.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthorHashValidationPipe } from '../authors/pipes/author-hash-validation.pipe';
import { GetSystemUser } from '../system-user/get-system-user.decorator';
import { SystemUser } from '../system-user/system-user.entity';
import { Request } from 'express';
import { Review } from './review.entity';
import { GetReviewsFilterDto } from './dto/get-reviews-filter.dto';

@UseGuards(AuthGuard())
@Controller('reviews')
export class ReviewsController {
  private readonly logger = new Logger('ReviewsController');

  constructor(
    private reviewsService: ReviewsService,
    private autorsService: AutorsService,
  ) {}

  @Get()
  getReviews(
    @Query(ValidationPipe) getReviewsFilterDto: GetReviewsFilterDto,
    @GetSystemUser() systemUser: SystemUser,
  ): Promise<Review[]> {
    this.logger.debug(
      `SystemUser "${
        systemUser.username
      }" trying to fetch reviews with filters ${JSON.stringify(
        getReviewsFilterDto,
      )}`,
    );
    return this.reviewsService.getReviews(getReviewsFilterDto, systemUser);
  }

  @Get('/:id')
  getReviewById(
    @Param('id', ParseIntPipe) id: number,
    @GetSystemUser() systemUser: SystemUser,
  ): Promise<Review> {
    this.logger.debug(
      `SystemUser ${systemUser.username} try to fetch review with id ${id}`,
    );
    return this.reviewsService.getReviewById(id, systemUser);
  }

  @Post()
  @UsePipes(ValidationPipe)
  async createReview(
    @Body() createReviewDto: CreateReviewDto,
    @Body('authorHash', AuthorHashValidationPipe) authorHash: string,
    @GetSystemUser() systemUser: SystemUser,
    @Req() req: Request,
  ): Promise<Review> {
    this.logger.verbose(
      `SystemUser "${
        systemUser.username
      }" trying to create new review with data: ${JSON.stringify(
        createReviewDto,
      )} and authorHash: ${authorHash}`,
    );
    const author = await this.autorsService.mergeAuthor(authorHash, systemUser);

    return this.reviewsService.createReview(
      createReviewDto,
      author,
      systemUser,
      req,
    );
  }

  @Delete('/:id')
  deleteReview(
    @Param('id', ParseIntPipe) id: number,
    @GetSystemUser() systemUser: SystemUser,
  ): Promise<void> {
    this.logger.debug(
      `SystemUser "${
        systemUser.username
      }" trying to delete review with ID ${id}`,
    );
    return this.reviewsService.deleteReview(id, systemUser);
  }
}
