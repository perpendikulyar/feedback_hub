import { PipeTransform, BadRequestException } from '@nestjs/common';

export class UserCookieValidationPipe implements PipeTransform {
  transform(value: string) {
    if (!this.isValidUserCookie(value)) {
      throw new BadRequestException(
        `userCookie must be a string an not be empty`,
      );
    }
    return value;
  }

  private isValidUserCookie(userCookie: string): boolean {
    if (userCookie.length > 0) {
      return true;
    } else {
      return false;
    }
  }
}
