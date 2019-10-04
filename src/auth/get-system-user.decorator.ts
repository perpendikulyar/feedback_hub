import { createParamDecorator, Body } from '@nestjs/common';
import { SystemUser } from './system-user.entity';

export const GetSystemUser = createParamDecorator(
  (data, req): SystemUser => {
    return req.user;
  },
);
