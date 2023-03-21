import { UserChatRoom } from "@app/msg-core/entities/user-chat-room/user-chat-room.entity";

export class UserChatRoomDto {
    userId: number;
    chatRoomId: number;

    constructor(userId: number, chatRoomId: number) {
        this.userId = userId;
        this.chatRoomId = chatRoomId;
    }

    static toUserChatRoom(dto: UserChatRoomDto): UserChatRoom {
        return new UserChatRoom(dto.userId, dto.chatRoomId);
    }
}