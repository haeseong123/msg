import { Message } from "@app/msg-core/entities/message/message.entity";

export abstract class MessageRepository {
    abstract findById(id: number): Promise<Message | null>;

    abstract findAllByChatRoomId(chatRoomId: number): Promise<Message[]>;

    abstract save(entity: Message): Promise<Message>;

    abstract remove(entity: Message): Promise<Message>;

    abstract removeAll(entities: Message[]): Promise<Message[]>;
}