import { Message } from "@app/msg-core/entities/message/message.entity";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export abstract class MessageRepository {
    abstract findAllByChatRoomIdAndSenderId(chatRoomId: number, senderId: number): Promise<Message[]>;

    abstract save(entity: Message): Promise<Message>;

    abstract update(id: number, partialEntity: QueryDeepPartialEntity<Message>): Promise<void>

    abstract delete(id: number): Promise<void>;

    abstract isOwnerTheMessage(id: number, senderId: number): Promise<boolean>;
}