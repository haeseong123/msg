import { ChatRoom } from '@app/msg-core/entities/chat-room/chat-room.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ChatRoomParticipant } from '@app/msg-core/entities/chat-room/chat-room-participant/chat-room-participant.entity';

@Injectable()
export class ChatRoomRepositoryImpl extends Repository<ChatRoom> {
  constructor(dataSource: DataSource) {
    super(ChatRoom, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<ChatRoom | null> {
    const chatRoomOrNull = await this.createQueryBuilder('cr')
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
    const qb = await this.createQueryBuilder('cr');
    const chatRooms = qb
      .leftJoinAndSelect('cr.participants', 'p')
      .where(
        'cr.id IN ' +
          qb
            .subQuery()
            .select('participant.chatRoomId')
            .from(ChatRoomParticipant, 'participant')
            .where('participant.userId = :userId', { userId })
            .getQuery(),
      )
      .getMany();

    return chatRooms;
  }
}
