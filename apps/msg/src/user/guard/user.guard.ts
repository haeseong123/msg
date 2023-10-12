import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { Request } from "express";
import { plainToInstance } from "class-transformer";
import { MsgUser } from "@app/msg-core/jwt/msg-user";
import { UnauthorizedAccessException } from "@app/msg-core/jwt/exception/unauthorizated-access.exception";

@Injectable()
export class UserGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const user = plainToInstance(MsgUser, request.user);
        const userIdFromParam = parseInt(request.params.userId, 10);

        const isValidaUserId = user.sub === userIdFromParam;
        
        if (!isValidaUserId) {
            throw new UnauthorizedAccessException();
        }

        return true;
    }
}