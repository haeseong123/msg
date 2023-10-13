import { TokenPayload } from "@app/msg-core/jwt/token-payload";
import { MsgUser } from "@app/msg-core/jwt/msg-user";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { Request } from "express";

/**
 * client req.user에서 특정 값 을 가져오거나 req.user 전부를 가져옵니다. 
 * 
 * req.user는 MsgUser 값이 들어가 있습니다.
 * 
 * libs/msg-core/jwt/strategy/access-token.strategy.ts 
 * libs/msg-core/jwt/strategy/refresh-token.strategy.ts
 */
export const CurrentUser = createParamDecorator(
    (key: keyof TokenPayload, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest<Request>();
        const user = plainToInstance(MsgUser, request.user);
        const currentUserValue = key ? user[key] : user;

        return currentUserValue;
    },
);
