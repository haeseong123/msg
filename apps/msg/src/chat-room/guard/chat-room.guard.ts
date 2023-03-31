import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UnauthorizedAccessException } from "../../auth/exceptions/unauthorized-access.exception";
import { ChatRoomService } from "../chat-room.service";
import { UserNotInChatRoomException } from "../exceptions/user-not-in-chat-room.exception";

@Injectable()
export class ChatRoomGuard implements CanActivate {
    constructor(private readonly chatRoomService: ChatRoomService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const userId = request.user?.sub;
        const chatRoomId = +request.params.chatRoomId;

        if (!userId || !chatRoomId) {
            throw new UnauthorizedAccessException();
        }

        const isUserInChatRoom = await this.chatRoomService.isUserInChatRoom(chatRoomId, userId);
        
        if (!isUserInChatRoom) {
            throw new UserNotInChatRoomException();
        }
        
        return true;
    }
}