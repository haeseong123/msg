import { TokenPayload } from "@app/msg-core/jwt/token-payload";
import { MsgUser } from "@app/msg-core/jwt/msg-user";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { Request } from "express";

export const CurrentUser = createParamDecorator(
    (key: keyof TokenPayload, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest<Request>();
        const user = plainToInstance(MsgUser, request.user);
        const currentUserValue = key ? user[key] : user;

        return currentUserValue;
    },
);
