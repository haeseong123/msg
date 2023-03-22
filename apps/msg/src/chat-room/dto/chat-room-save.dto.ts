import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";
import { IsNotEmpty } from "class-validator";

export class ChatRoomSaveDto {
    @IsNotEmpty()
    name: string;
    
    @IsNotEmpty()
    invitedUserIds: number[];

    static toChatRoom(dto: ChatRoomSaveDto): ChatRoom {
        return new ChatRoom(dto.name);
    }
}