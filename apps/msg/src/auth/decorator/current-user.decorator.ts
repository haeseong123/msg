import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPayload } from "../jwt/jwt-payload";
import { plainToInstance } from "class-transformer";
import { MsgUser } from "../jwt/msg-user";
import { Request } from "express";

export const CurrentUser = createParamDecorator(
    (key: keyof JwtPayload, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest<Request>();
        const user = plainToInstance(MsgUser, request.user);
        const currentUserValue = key ? user[key] : user;

        return currentUserValue;
    },
);
