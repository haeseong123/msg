import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { UnauthorizedAccessException } from "../../auth/exceptions/unauthorized-access.exception";
import { Request } from "express";
import { plainToInstance } from "class-transformer";
import { MsgUser } from "../../auth/jwt/msg-user";

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