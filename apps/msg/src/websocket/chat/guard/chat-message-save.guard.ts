import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { MessageSaveDto } from "apps/msg/src/message/dto/message-save.dto";
import { SocketWithAuthAndChatRoomId } from "../../socketIO/socket-types";
import { UnauthorizedAccessException } from "@app/msg-core/jwt/exception/unauthorizated-access.exception";
import { Observable } from "rxjs";

@Injectable()
export class ChatMessageSaveGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const client = context.switchToWs().getClient<SocketWithAuthAndChatRoomId>();
        const dto = context.switchToWs().getData<MessageSaveDto>();

        const isValidId = client.sub === dto.sentUserId;
        const isValidChatRoomId = client.chatRoomId === dto.sentChatRoomId;

        if (!isValidId || !isValidChatRoomId) {
            throw new UnauthorizedAccessException();
        }

        return true;
    }
}