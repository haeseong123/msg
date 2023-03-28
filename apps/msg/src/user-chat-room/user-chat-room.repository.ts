import { UserChatRoom } from "@app/msg-core/entities/user-chat-room/user-chat-room.entity";

export abstract class UserChatRoomRepository {
    abstract save(entity: UserChatRoom): Promise<UserChatRoom>;

    abstract saveAll(entities: UserChatRoom[]): Promise<UserChatRoom[]>;

    abstract remove(entity: UserChatRoom): Promise<UserChatRoom>;
}