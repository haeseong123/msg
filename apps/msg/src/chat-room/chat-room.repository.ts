import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";

export abstract class ChatRoomRepository {
    abstract findByUserId(userId: number): Promise<ChatRoom[]>;

    abstract findWithUserChatRoomsById(id: number): Promise<ChatRoom | null>;

    abstract save(entity: ChatRoom): Promise<ChatRoom>;

    abstract remove(entity: ChatRoom): Promise<ChatRoom>;
}