import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";
import { UserChatRoom } from "@app/msg-core/entities/user-chat-room/user-chat-room.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ChatRoomRepository } from "./chat-room.repository";

@Injectable()
export class ChatRoomRepositoryImpl implements ChatRoomRepository {
    constructor(
        @InjectRepository(ChatRoom)
        private readonly repository: Repository<ChatRoom>
    ) { }

    findByUserId(userId: number): Promise<ChatRoom[]> {
        return this.repository.createQueryBuilder('cr')
            .innerJoinAndSelect('cr.userChatRooms', 'ucr')
            .leftJoinAndSelect('ucr.user', 'u')
            .leftJoinAndSelect('cr.messages', 'm')
            .where((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select('userChatRoom.chatRoomId')
                    .from(UserChatRoom, 'userChatRoom')
                    .where('userChatRoom.userId = :userId', { userId })
                    .getQuery();
                return 'cr.id IN ' + subQuery;
            })
            .getMany();
    }

    findWithUserChatRoomsById(id: number): Promise<ChatRoom | null> {
        return this.repository.createQueryBuilder('cr')
            .innerJoinAndSelect('cr.userChatRooms', 'ucr')
            .where('cr.id = :id', { id })
            .getOne();
    }

    save(entity: ChatRoom): Promise<ChatRoom> {
        return this.repository.save(entity);
    }

    remove(entity: ChatRoom): Promise<ChatRoom> {
        return this.repository.remove(entity);
    }
}