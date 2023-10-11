import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UnauthorizedAccessException } from "../../auth/exceptions/unauthorized-access.exception";
import { Request } from "express";
import { plainToInstance } from "class-transformer";
import { MessageSaveDto } from "../dto/message-save.dto";
import { Observable } from "rxjs";

@Injectable()
export class MessageSaveGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const dto = plainToInstance(MessageSaveDto, request.body);
        const userIdFromParam = parseInt(request.params.userId, 10);
        const chatRoomIdFromParam = parseInt(request.params.chatRoomId, 10);

        const isValidUserId = dto.sentUserId === userIdFromParam;
        const isValidChatRoomId = dto.sentChatRoomId === chatRoomIdFromParam;
        
        if (!isValidUserId || !isValidChatRoomId) {
            throw new UnauthorizedAccessException();
        }

        return true;
    }
}