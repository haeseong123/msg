import { UserRelationshipStatus } from '@app/msg-core/entities/user-relationship/user-relationship-status';
import { Injectable } from '@nestjs/common';
import { UnauthorizedInvitationException } from './exceptions/unauthorized-invitation.exception';
import { UserChatRoomDto } from '../user-chat-room/dto/user-chat-room.dto';
import { UserChatRoomService } from '../user-chat-room/user-chat-room.service';
import { UserService } from '../user/user.service';
import { ChatRoomRepository } from './chat-room.repository';
import { ChatRoomSaveDto } from './dto/chat-room-save.dto';
import { UserNotInChatRoomException } from './exceptions/user-not-in-chat-room.exception';
import { ChatRoom } from '@app/msg-core/entities/chat-room/chat-room.entity';
import { UserDuplicateInvitationException } from './exceptions/user-duplicate-invitation.exception';
import { User } from '@app/msg-core/entities/user/user.entity';

@Injectable()
export class ChatRoomService {
    constructor(
        private chatRoomRepository: ChatRoomRepository,
        private userChatRoomService: UserChatRoomService,
        private userService: UserService,
    ) { }

    async findAll(userId: number): Promise<ChatRoom[]> {
        return await this.chatRoomRepository.findByUserId(userId);
    }

    async save(userId: number, dto: ChatRoomSaveDto): Promise<ChatRoom> {
        const invitedUserIds = dto.invitedUserIds;
        this.validateInvitedUserIds(invitedUserIds);

        const founder = await this.userService.findUserWithRelationshipById(userId);
        this.validateInvitationsByFounder(founder, invitedUserIds);

        const chatRoom = await this.chatRoomRepository.save(dto.toEntity());
        const participantsIds = [founder.id, ...invitedUserIds];
        const userChatRooms = await this.userChatRoomService.saveAll(participantsIds.map(
            userId => new UserChatRoomDto(userId, chatRoom.id)
        ));
        chatRoom.userChatRooms = userChatRooms;

        return chatRoom;
    }

    async delete(chatRoomId: number, userId: number) {
        const chatRoom = await this.chatRoomRepository.findWithUserChatRoomsById(chatRoomId);
        const userChatRoom = chatRoom?.userChatRooms.find(ucr => ucr.userId === userId);

        if (!userChatRoom) {
            throw new UserNotInChatRoomException();
        }

        if (chatRoom.userChatRooms.length === 1) {
            await this.chatRoomRepository.remove(chatRoom);
        } else {
            await this.userChatRoomService.remove(userChatRoom);
        }

        return
    }

    private validateInvitedUserIds(invitedUserIds: number[]): void {
        const invitedUserIdsSet = new Set(invitedUserIds);

        if (invitedUserIdsSet.size < invitedUserIds.length) {
            throw new UserDuplicateInvitationException();
        }
    }

    private validateInvitationsByFounder(founder: User, invitedUserIds: number[]): void {
        const invitedUserIdsSet = new Set(invitedUserIds);
        const invitedByFounder = founder.relationshipFromMe.filter(
            r => r.status === UserRelationshipStatus.FOLLOW && invitedUserIdsSet.has(r.toUserId)
        );

        if (invitedByFounder.length < invitedUserIds.length) {
            throw new UnauthorizedInvitationException();
        }
    }
}
