import { Message } from "@app/msg-core/entities/message/message.entity";
import { MessageDto } from "./dto/message.dto";

export class MessageConverter {
    static toMessageDto(message: Message): MessageDto {
        return new MessageDto(
            message.id,
            message.senderId,
            message.chatRoomId,
            message.content
        );
    }
}