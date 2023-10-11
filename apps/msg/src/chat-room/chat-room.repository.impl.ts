import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";
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

    async findById(id: number): Promise<ChatRoom | null> {
        const chatRoom = await this.repository.findOneBy({ id });

        return chatRoom;
    }

    async findByUserId(userId: number): Promise<ChatRoom[]> {
        const chatRooms = await this.repository.createQueryBuilder('cr')
            .leftJoinAndSelect('cr.participants', 'p')
            .where('p.userId = :userId', { userId })
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

    // findByUserId(userId: number): Promise<ChatRoom[]> {
    //     return this.repository.createQueryBuilder('cr')
    //         .leftJoinAndSelect('cr.userChatRooms', 'ucr')
    //         .leftJoinAndSelect('ucr.user', 'u')
    //         .leftJoinAndSelect('cr.messages', 'm')
    //         .where('ucr.userId = :userId', { userId })
    //         .getMany();
    // }

    // findByIdAndUserId(id: number, userId: number): Promise<ChatRoom | null> {
    //     return this.repository.createQueryBuilder('cr')
    //         .leftJoinAndSelect('cr.userChatRooms', 'ucr')
    //         .leftJoinAndSelect('ucr.user', 'u')
    //         .leftJoinAndSelect('cr.messages', 'm')
    //         .where('cr.id = :id', { id })
    //         .andWhere('ucr.userId = :userId', { userId })
    //         .getOne();
    // }

    // findWithUserChatRoomsById(id: number): Promise<ChatRoom | null> {
    //     return this.repository.createQueryBuilder('cr')
    //         .innerJoinAndSelect('cr.userChatRooms', 'ucr')
    //         .where('cr.id = :id', { id })
    //         .getOne();
    // }

    // isUserInChatRoom(id: number, userId: number): Promise<boolean> {
    //     return this.repository.createQueryBuilder('cr')
    //         .innerJoinAndSelect('cr.userChatRooms', 'ucr')
    //         .where('cr.id = :id', { id })
    //         .andWhere('ucr.userId = :userId', { userId })
    //         .getExists();
    // }
}