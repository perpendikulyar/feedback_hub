import { PipeTransform, BadRequestException } from '@nestjs/common';

export class CreatorHashValidationPipe implements PipeTransform {
  transform(value: string) {
    if (!this.isValidCreatorHash(value)) {
      throw new BadRequestException(
        `creatorHash must be a string an not be empty`,
      );
    }
    return value;
  }

  private isValidCreatorHash(creatorHash: string): boolean {
    if (creatorHash.length > 0) {
      return true;
    } else {
      return false;
    }
  }
}
