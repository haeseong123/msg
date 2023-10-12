import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { UserRelationFromIdUserIdMismatchException } from "../exceptions/user-relation-from-id-user-id-mismatch.exception";
import { plainToInstance } from "class-transformer";
import { UserRelationDto } from "../dto/user-relation.dto";
import { Request } from "express";
import { MsgUser } from "@app/msg-core/jwt/msg-user";

@Injectable()
export class UserRelationSaveGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const user = plainToInstance(MsgUser, request.user);
        const relationDto = plainToInstance(UserRelationDto, request.body);

        const isValidUserId = user.sub === relationDto.fromUserId;
        if (isValidUserId) {
            throw new UserRelationFromIdUserIdMismatchException();
        }

        return true;
    }
}