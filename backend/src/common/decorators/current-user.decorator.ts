import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator<
  keyof Express.User | undefined,
  ExecutionContext
>((field, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;

  return field ? user?.[field] : user;
});
