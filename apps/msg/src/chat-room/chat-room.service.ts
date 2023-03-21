import { UserRelationshipStatus } from '@app/msg-core/entities/user-relationship/user-relationship-status';
import { Injectable } from '@nestjs/common';
import { UnauthorizedInvitationException } from '../exceptions/chat-room/unauthorized-invitation.exception';
import { UserNotInChatRoomException } from '../exceptions/chat-room/user-not-in-chat-room.exception';
import { UserChatRoomDto } from '../user-chat-room/dto/user-chat-room.dto';
import { UserChatRoomService } from '../user-chat-room/user-chat-room.service';
import { UserService } from '../user/user.service';
import { ChatRoomRepository } from './chat-room.repository';
import { ChatRoomDeletedDto } from './dto/chat-room-deleted-dto';
import { ChatRoomSaveDto } from './dto/chat-room-save.dto';
import { ChatRoomSavedResultDto } from './dto/chat-room-saved-result.dto';
import { ChatRoomUserDto } from './dto/chat-room-user.dto';
import { ChatRoomDto } from './dto/chat-room.dto';

@Injectable()
export class ChatRoomService {
    constructor(
        private chatRoomRepository: ChatRoomRepository,
        private userChatRoomService: UserChatRoomService,
        private userService: UserService,
    ) { }

    async findChatRooms(userId: number): Promise<ChatRoomDto[]> {
        const chatRooms = await this.chatRoomRepository.findChatRoomsByUserId(userId);
        const chatRoomDtos: ChatRoomDto[] = chatRooms.map(cr => new ChatRoomDto(cr.id, cr.name, [], []));
        return chatRoomDtos;
    }

    async save(userId: number, dto: ChatRoomSaveDto): Promise<ChatRoomSavedResultDto> {
        const founder = await this.userService.findUserWithRelationship(userId);
        const invitedUserIds = dto.invitedUserIds;
        const invitedUserIdsSet = new Set(invitedUserIds);
        const invitedByFounder = founder.relationshipFromMe.filter(
            r => r.status === UserRelationshipStatus.FOLLOW && invitedUserIdsSet.has(r.toUserId)
        );

        if (invitedByFounder.length < invitedUserIds.length) {
            throw new UnauthorizedInvitationException();
        }

        const chatRoom = await this.chatRoomRepository.save(ChatRoomSaveDto.toChatRoom(dto));
        const userChatRooms: UserChatRoomDto[] = [
            { userId: founder.id, chatRoomId: chatRoom.id },
            ...invitedUserIds.map(userId => new UserChatRoomDto(userId, chatRoom.id))
        ]

        await this.userChatRoomService.saveAll(userChatRooms);

        const participants: ChatRoomUserDto[] = [
            new ChatRoomUserDto(founder.id, founder.email, founder.nickname),
            ...invitedByFounder.map(
                invitation => new ChatRoomUserDto(invitation.toUser.id, invitation.toUser.email, invitation.toUser.nickname)
            )
        ];
        const resultDto: ChatRoomSavedResultDto = new ChatRoomSavedResultDto(chatRoom.id, chatRoom.name, participants);

        return resultDto
    }

    async delete(chatRoomId: number, userId: number): Promise<ChatRoomDeletedDto> {
        const chatRoom = await this.chatRoomRepository.findChatRoomWithUserChatRoomsById(chatRoomId);
        const userChatRoom = chatRoom?.userChatRooms.find(ucr => ucr.userId === userId);

        if (!userChatRoom) {
            throw new UserNotInChatRoomException();
        }

        if (chatRoom.userChatRooms.length === 1) {
            await this.chatRoomRepository.remove(chatRoom);
        } else {
            await this.userChatRoomService.remove(userChatRoom);
        }

        const resultDto: ChatRoomDeletedDto = new ChatRoomDeletedDto(chatRoom.id, chatRoom.name);

        return resultDto;
    }
}
