import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    if (ctx.getType() === "ws") {
      return ctx.switchToWs().getClient().user;
    }
    return ctx.switchToHttp().getRequest().user;
  },
);
