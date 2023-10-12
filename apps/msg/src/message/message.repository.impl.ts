import { Message } from "@app/msg-core/entities/message/message.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MessageRepository } from "./message.repository";

export class MessageRepositoryImpl extends MessageRepository {
    constructor(
        @InjectRepository(Message)
        private readonly repository: Repository<Message>
    ) {
        super();
    }

    async findById(id: number): Promise<Message | null> {
        const message = await this.repository.findOneBy({ id });

        return message;
    }

    async findAllByChatRoomId(chatRoomId: number): Promise<Message[]> {
        const messages = await this.repository.findBy({ sentChatRoomId: chatRoomId });

        return messages;
    }

    async save(entity: Message): Promise<Message> {
        const savedMessage = await this.repository.save(entity);

        return savedMessage;
    }

    async remove(entity: Message): Promise<Message> {
        const removedMessage = await this.repository.remove(entity);

        return removedMessage;
    }

    async removeAll(entities: Message[]): Promise<Message[]> {
        const removedMessages = await this.repository.remove(entities);

        return removedMessages;
    }
}