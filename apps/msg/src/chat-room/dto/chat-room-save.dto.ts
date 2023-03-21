import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";

export class ChatRoomSaveDto {
    name: string;
    invitedUserIds: number[];

    static toChatRoom(dto: ChatRoomSaveDto): ChatRoom {
        return new ChatRoom(dto.name);
    }
}