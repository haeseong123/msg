import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";
import { IsNotEmpty } from "class-validator";

export class ChatRoomSaveDto {
    @IsNotEmpty()
    name: string;
    
    @IsNotEmpty()
    invitedUserIds: number[];

    toEntity(): ChatRoom {
        return new ChatRoom(this.name);
    }
}