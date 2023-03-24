import { UserChatRoom } from '@app/msg-core/entities/user-chat-room/user-chat-room.entity';
import { Injectable } from '@nestjs/common';
import { UserChatRoomDto } from './dto/user-chat-room.dto';
import { UserChatRoomRepository } from './user-chat-room.repository';

@Injectable()
export class UserChatRoomService {
    constructor(private userChatRoomRepository: UserChatRoomRepository) { }

    async save(dto: UserChatRoomDto): Promise<UserChatRoom> {
        return await this.userChatRoomRepository.save(dto.toEntity());
    }

    async saveAll(dtos: UserChatRoomDto[]): Promise<UserChatRoom[]> {
        const entities: UserChatRoom[] = dtos.map(dto => dto.toEntity());
        return await this.userChatRoomRepository.save(entities);
    }

    async remove(entity: UserChatRoom): Promise<UserChatRoom> {
        return await this.userChatRoomRepository.remove(entity);
    }
}
