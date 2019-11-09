import { createParamDecorator } from '@nestjs/common';

/**
 * Allows you to use "@Usr() user: User" in controller params
 * for retrieving the user on authenticated requests.
 */
export const Usr = createParamDecorator((data, req) => {
  return req.user;
});
