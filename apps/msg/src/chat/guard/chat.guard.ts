import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { MessageDto } from "../../message/dto/message.dto";
import { UnauthorizedAccessException } from "../../auth/exceptions/unauthorized-access.exception";
import { ChatRoomService } from "../../chat-room/chat-room.service";

@Injectable()
export class ChatGuard implements CanActivate {
    constructor(private readonly chatRoomService: ChatRoomService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient();
        const dto: MessageDto = context.switchToWs().getData();

        if (!dto.senderId || dto.senderId !== client.sub ||
            !dto.chatRoomId || dto.chatRoomId !== client.chatRoomId ||
            !(await this.chatRoomService.isUserInChatRoom(client.chatRoomId, client.sub))) {
            throw new UnauthorizedAccessException();
        }

        return true;
    }
}