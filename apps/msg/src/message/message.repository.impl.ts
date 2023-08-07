import { Message } from "@app/msg-core/entities/message/message.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MessageRepository } from "./message.repository";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export class MessageRepositoryImpl extends MessageRepository {
    constructor(
        @InjectRepository(Message)
        private readonly repository: Repository<Message>
    ) {
        super();
    }

    findAllByChatRoomIdAndSenderId(chatRoomId: number, senderId: number): Promise<Message[]> {
        return this.repository.findBy({ chatRoomId, senderId });
    }

    save(entity: Message): Promise<Message> {
        return this.repository.save(entity);
    }

    async update(id: number, partialEntity: QueryDeepPartialEntity<Message>): Promise<void> {
        await this.repository.update(id, partialEntity);

        return;
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);

        return;
    }

    isOwnerTheMessage(id: number, senderId: number): Promise<boolean> {
        return this.repository.createQueryBuilder('m')
            .where('m.id = :id', { id })
            .andWhere('m.senderId = :senderId', { senderId })
            .getExists();
    }
}