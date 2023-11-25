import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from 'src/common';

export const InjectUser = createParamDecorator(
  (_: never, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as User;
  },
);
