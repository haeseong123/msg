import { UserChatRoom } from '@app/msg-core/entities/user-chat-room/user-chat-room.entity';
import { Injectable } from '@nestjs/common';
import { UserChatRoomDto } from './dto/user-chat-room.dto';
import { UserChatRoomRepository } from './user-chat-room.repository';

@Injectable()
export class UserChatRoomService {
    constructor(private userChatRoomRepository: UserChatRoomRepository) { }

    async save(dto: UserChatRoomDto): Promise<UserChatRoomDto> {
        const result = await this.userChatRoomRepository.save(UserChatRoomDto.toUserChatRoom(dto));
        const resultDto: UserChatRoomDto = new UserChatRoomDto(result.userId, result.chatRoomId);
        return resultDto;
    }

    async saveAll(dtos: UserChatRoomDto[]): Promise<UserChatRoomDto[]> {
        const entities: UserChatRoom[] = dtos.map(dto => UserChatRoomDto.toUserChatRoom(dto));
        const userChatRooms = await this.userChatRoomRepository.save(entities);
        const resultDto: UserChatRoomDto[] = userChatRooms.map(ucr => new UserChatRoomDto(
            ucr.userId,
            ucr.chatRoomId
        ));
        return resultDto;
    }

    async remove(entity: UserChatRoom) {
        const removedEntity = await this.userChatRoomRepository.remove(entity);
        const resultDto: UserChatRoomDto = new UserChatRoomDto(
            removedEntity.userId,
            removedEntity.chatRoomId,
        )
        return resultDto;
    }
}
