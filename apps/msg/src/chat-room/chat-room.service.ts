import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ChatRoomRepository } from './chat-room.repository';
import { ChatRoomSaveDto } from './dto/chat-room-save.dto';
import { ChatRoom } from '@app/msg-core/entities/chat-room/chat-room.entity';
import { UnauthorizedInvitationException } from './exceptions/unauthorized-invitation.exception';
import { UserRelationStatusEnum } from '@app/msg-core/entities/user/user-relation/user-relation-status.enum';
import { UserService } from '../user/user.service';
import { UserNotFoundedException } from '../user/user-relation/exceptions/user-not-found.exception';
import { MessageService } from '../message/message.service';
import { ChatRoomLeaveDto } from './dto/chat-room-leave.dto';
import { HostIdInInvitedUserIdsException } from './exceptions/host-id-in-invited-user-ids.exception';
import { MaxInvitedIdsException } from './exceptions/max-invited-ids.exception';
import { InvitedDutplicateException } from './exceptions/invited-dutplicate.exception';
import { UserNotInChatRoomException } from './exceptions/user-not-in-chat-room.exception';
import { ChatRoomNotFoundException } from './exceptions/chat-room-not-found.exception';
import { TransactionService } from '../common/database/transaction/transaction-service';

@Injectable()
export class ChatRoomService {
    constructor(
        private chatRoomRepository: ChatRoomRepository,
        private userService: UserService,
        /**
         * @deprecated 의존성 순환 문제 해결 필요
         * 
         * 어떻게??
         */
        @Inject(forwardRef(() => MessageService))
        private messageService: MessageService,
        private transactionService: TransactionService,
    ) { }

    async findById(id: number): Promise<ChatRoom | null> {
        return await this.chatRoomRepository.findById(id);
    }

    async findByIdOrThrow(id: number): Promise<ChatRoom> {
        const chatRoom = await this.findById(id);

        if (!chatRoom) {
            throw new ChatRoomNotFoundException();
        }

        return chatRoom;
    }

    async findAllByUserId(userId: number): Promise<ChatRoom[]> {
        return await this.chatRoomRepository.findByUserId(userId);
    }

    async save(dto: ChatRoomSaveDto): Promise<ChatRoom> {
        /**
         * `초대 목록`은 중복이 없어야 합니다.
         */
        const inviteeUserIdSet: Set<number> = new Set(dto.invitedUserIds);
        if (inviteeUserIdSet.size < dto.invitedUserIds.length) {
            throw new InvitedDutplicateException();
        }

        /**
         * `초대 목록`에 호스트의 id가 있어선 안 됩니다.
         */
        if (inviteeUserIdSet.has(dto.hostUserId)) {
            throw new HostIdInInvitedUserIdsException();
        }

        /**
         * 채팅방의 최대 수용 인원은 `10`명입니다. 
         * 
         * => 호스트도 채팅방에 들어가야 하니 `초대 목록`의 최대 길이는 `9`입니다.
         */
        const chatRoomMaxSize = 10 - 1;
        if (inviteeUserIdSet.size > chatRoomMaxSize) {
            throw new MaxInvitedIdsException();
        }

        /**
         * 호스트 id에 해당되는 유저가 DB에 존재해야 합니다.
         */
        const host = await this.userService.findByIdOrThrow(dto.hostUserId);

        /**
         * 초대 목록에 있는 유저는 모두 호스트 유저가 FOLLOW 한 유저야 합니다.
         * 
         * 즉, `초대 목록`과 `호스트가 FOLLOW 중인 관계`의 교집합은 `초대 목록`과 크기가 같아야 합니다.
         */
        const intersection = host.relations.filter(r =>
            r.status === UserRelationStatusEnum.FOLLOW &&
            inviteeUserIdSet.has(r.toUserId)
        );
        if (intersection.length !== inviteeUserIdSet.size) {
            throw new UnauthorizedInvitationException();
        }

        /**
         * 채팅방을 생성합니다.
         */
        const chatRoom = dto.toEntity();

        return await this.chatRoomRepository.save(chatRoom);
    }

    async leaveChatRoom(dto: ChatRoomLeaveDto): Promise<ChatRoom> {
        const chatRoom = await this.chatRoomRepository.findById(dto.chatRoomId);

        /**
         * 채팅방이 존재하는지 확인합니다.
         */
        if (!chatRoom) {
            throw new ChatRoomNotFoundException();
        }

        /**
         * 요청을 보낸 유저가 해당 채팅방에 참여중인지 확인합니다.
         */
        const participant = chatRoom.participants.find(p => p.userId === dto.userId);
        if (!participant) {
            throw new UserNotInChatRoomException();
        }

        /**
         * 채팅방에 참여자가 한명이면 채팅방을 삭제하고 채팅방에 있는 모든 메시지도 삭제합니다.
         * 
         * 채팅방에 참여자가 둘 이상이라면 채팅방을 나가기만 합니다.
         */
        if (chatRoom.participants.length <= 1) {
            /** 채팅방에 있는 모든 메시지 삭제 + 채팅방 삭제 */
            await this.transactionService.logicWithTransaction(async () => {
                await this.messageService.removeAllByChatRoomId(chatRoom.id);
                await this.chatRoomRepository.remove(chatRoom);
            });
        } else {
            /** 채팅방 나가기 */
            chatRoom.leaveChatRoom(participant);
            await this.chatRoomRepository.save(chatRoom);
        }

        return chatRoom;
    }
}