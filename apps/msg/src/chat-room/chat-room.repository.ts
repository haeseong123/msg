import { ChatRoom } from '@app/msg-core/entities/chat-room/chat-room.entity';

export abstract class ChatRoomRepository {
  abstract findById(id: number): Promise<ChatRoom | null>;

  abstract findByUserId(userId: number): Promise<ChatRoom[]>;

  abstract save(entity: ChatRoom): Promise<ChatRoom>;

  abstract remove(entity: ChatRoom): Promise<ChatRoom>;
}
