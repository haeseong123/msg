import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";
import { UserChatRoom } from "@app/msg-core/entities/user-chat-room/user-chat-room.entity";
import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class ChatRoomRepository extends Repository<ChatRoom> {
    constructor(private dataSource: DataSource) {
        super(ChatRoom, dataSource.createEntityManager());
    }

    async findChatRoomsByUserId(userId: number): Promise<ChatRoom[] | undefined> {
        const result = await this.createQueryBuilder('cr')
            .innerJoinAndSelect('cr.userChatRooms', 'ucr')
            .leftJoinAndSelect('ucr.user', 'u')
            .leftJoinAndSelect('cr.messages', 'm')
            .where((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select('userChatRoom.chatRoomId')
                    .from(UserChatRoom, 'userChatRoom')
                    .where('userChatRoom.userId = :userId')
                    .getQuery();
                return 'cr.id IN ' + subQuery;
            })
            .setParameter('userId', userId)
            .getMany();

        return result;
    }

    async findChatRoomWithUserChatRoomsById(id: number): Promise<ChatRoom | null> {
        const result = await this.createQueryBuilder('cr')
            .innerJoin('cr.userChatRooms', 'ucr')
            .where('cr.id = :id', { id })
            .getOne();

        return result;
    }
}