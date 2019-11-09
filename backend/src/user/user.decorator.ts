import { createParamDecorator } from '@nestjs/common';

export const Usr = createParamDecorator((data, req) => {
  return req.user;
});
