import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ChatRoomRepository } from "./chat-room.repository";
import { ChatRoomParticipant } from "@app/msg-core/entities/chat-room/chat-room-participant/chat-room-participant.entity";

@Injectable()
export class ChatRoomRepositoryImpl implements ChatRoomRepository {
    constructor(
        @InjectRepository(ChatRoom)
        private readonly repository: Repository<ChatRoom>
    ) { }

    async findById(id: number): Promise<ChatRoom | null> {
        const chatRoomOrNull = await this.repository.createQueryBuilder('cr')
            .leftJoinAndSelect('cr.participants', 'p')
            .where('cr.id = :id', { id })
            .getOne();

        return chatRoomOrNull;
    }

    async findByUserId(userId: number): Promise<ChatRoom[]> {
        /**
         * SELECT 
         *       cr.*, 
         *       p.*
         *   FROM
         *       chat_room cr
         *   LEFT JOIN
         *       chat_room_participant p
         *   ON
         *       cr.id = p.chat_room_id
         *   WHERE
         *       cr.id IN (
         *           SELECT 
         *               chat_room_id
         *           FROM
         *               chat_room_participant
         *           WHERE
         *               user_id = [?]
         *       );
         */
        const qb = await this.repository.createQueryBuilder('cr');
        const chatRooms = qb
            .leftJoinAndSelect('cr.participants', 'p')
            .where('cr.id IN ' +
                qb
                    .subQuery()
                    .select('participant.chatRoomId')
                    .from(ChatRoomParticipant, 'participant')
                    .where('participant.userId = :userId', { userId })
                    .getQuery()
            )
            .getMany();

        return chatRooms;
    }

    async save(entity: ChatRoom): Promise<ChatRoom> {
        return await this.repository.save(entity);
    }

    async remove(entity: ChatRoom): Promise<ChatRoom> {
        const removedEntity = await this.repository.remove(entity);

        return removedEntity;
    }
}