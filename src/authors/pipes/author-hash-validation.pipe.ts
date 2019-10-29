import { PipeTransform, BadRequestException } from '@nestjs/common';

export class AuthorHashValidationPipe implements PipeTransform {
  transform(value: string) {
    if (!this.isValidAuthorHash(value)) {
      throw new BadRequestException(
        `authorHash must be a string an not be empty`,
      );
    }
    return value;
  }

  private isValidAuthorHash(authorHash: string): boolean {
    if (authorHash.length > 0) {
      return true;
    } else {
      return false;
    }
  }
}
