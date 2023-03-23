import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPayload } from "../jwt/jwt-payload";

export const CurrentUser = createParamDecorator(
    (data: keyof JwtPayload, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        return data ? user?.[data] : user;
    },
);