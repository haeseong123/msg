import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UsingRefreshTokenDto } from '../dto/using-refresh-token.dto';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import { MsgUser } from '@app/msg-core/jwt/msg-user';

export const UsingRefreshToken = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest<Request>();
        const user = plainToInstance(MsgUser, request.user);
        const dto = new UsingRefreshTokenDto(user.sub, user.token);

        return dto;
    },
);
