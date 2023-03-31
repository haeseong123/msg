import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UnauthorizedAccessException } from "../../auth/exceptions/unauthorized-access.exception";
import { MessageService } from "../message.service";

@Injectable()
export class MessageGuard implements CanActivate {
    constructor(private readonly messageService: MessageService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.sub;
        const chatRoomId = +request.params.chatRoomId;
        const messageId = +request.params.messageId;

        if (!userId || !chatRoomId || !messageId) {
            throw new UnauthorizedAccessException();
        }

        const isOwnerTheMessage = await this.messageService.isOwnerTheMessage(messageId, userId);

        if (!isOwnerTheMessage) {
            throw new UnauthorizedAccessException();
        }
        
        return true;
    }
}