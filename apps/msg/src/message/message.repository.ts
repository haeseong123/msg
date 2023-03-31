import { Message } from "@app/msg-core/entities/message/message.entity";

export abstract class MessageRepository {
    abstract findAllByChatRoomIdAndSenderId(chatRoomId: number, senderId: number): Promise<Message[]>;

    abstract save(entity: Message): Promise<Message>;

    abstract updateContent(id: number, content: string): Promise<void>;

    abstract delete(id: number): Promise<void>;

    abstract isOwnerTheMessage(id: number, senderId: number): Promise<boolean>;
}