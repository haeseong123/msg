import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ChatRoomRepository } from './chat-room.repository';
import { ChatRoomSaveDto } from './dto/chat-room-save.dto';
import { ChatRoom } from '@app/msg-core/entities/chat-room/chat-room.entity';
import { UserService } from '../user/user.service';
import { MessageService } from '../message/message.service';
import { HostIdInInvitedUserIdsException } from './exceptions/host-id-in-invited-user-ids.exception';
import { MaxInvitedIdsException } from './exceptions/max-invited-ids.exception';
import { InvitedDutplicateException } from './exceptions/invited-dutplicate.exception';
import { ChatRoomNotFoundException } from './exceptions/chat-room-not-found.exception';
import { ChatRoomWithMessagesSearchDto } from './dto/chat-room-with-messages-search.dto';
import { ChatRoomWithMessagesDto } from './dto/chat-room-with-messages.dto';

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
    ) { }

    /**
     * chatRoom 엔티티를 받아서 그대로 저장합니다.
     */
    async saveByEntity(chatRoom: ChatRoom): Promise<ChatRoom> {
        return await this.chatRoomRepository.save(chatRoom);
    }

    /**
     * chatRoom 엔티티를 받아서 그대로 삭제합니다.
     */
    async removeByEntity(chatRoom: ChatRoom): Promise<ChatRoom> {
        return await this.chatRoomRepository.remove(chatRoom);
    }
    
    /**
     * id에 해당되는 chatRoom을 반환합니다.
     * 
     * 해당되는 chatRoom이 없다면 null을 반환합니다.
     */
    async findById(id: number): Promise<ChatRoom | null> {
        return await this.chatRoomRepository.findById(id);
    }

    /**
     * id에 해당되는 chatRoom을 반환합니다.
     * 
     * 해당되는 chatRoom이 없다면 예외를 던집니다.
     */
    async findByIdOrThrow(id: number): Promise<ChatRoom> {
        const chatRoom = await this.findById(id);

        if (!chatRoom) {
            throw new ChatRoomNotFoundException();
        }

        return chatRoom;
    }

    /** 
     * userId에 해당되는 회원이 참여중인 모든 채팅방을 가져옵니다. 
     * */
    async findAllByUserId(userId: number): Promise<ChatRoom[]> {
        return await this.chatRoomRepository.findByUserId(userId);
    }

    /** 
     * 회원이 참여중인 특정(하나의) 채팅방을 가져옵니다. 
     * 
     * 해당 채팅방의 모든 메시지도 함께 가져옵니다.
     * */
    async findChatRoomWithMessages(dto: ChatRoomWithMessagesSearchDto): Promise<ChatRoomWithMessagesDto> {
        /**
         * dto.chatRoomId에 해당되는 채팅방을 가져옵니다.
         * 
         * dto.chatRoomId에 해당되는 채팅방에 있는 모든 메시지를 가져옵니다.
         */
        const [chatRoom, messages] = await Promise.all([
            this.findByIdOrThrow(dto.chatRoomId),
            this.messageService.findAllByChatRoomId(dto.chatRoomId),
        ]);

        /**
         * 채팅방에 dto.userId가 참여중인지 확인합니다.
         */
        chatRoom.findParticipantByUserIdOrThrow(dto.userId);

        const chatRoomWithMessagesDto = ChatRoomWithMessagesDto.of(chatRoom, messages);

        return chatRoomWithMessagesDto;
    }

    /** 
     * 채팅방을 생성합니다.
     * */
    async save(dto: ChatRoomSaveDto): Promise<ChatRoom> {
        /**
         * `초대 목록`은 중복이 없어야 합니다.
         */
        const inviteeUserIdSet: Set<number> = new Set(dto.invitedUserIds);
        if (inviteeUserIdSet.size < dto.invitedUserIds.length) {
            throw new InvitedDutplicateException();
        }

        /**
         * `초대 목록`에 dto.hostUserId가 있으면 안 됩니다.
         */
        if (inviteeUserIdSet.has(dto.hostUserId)) {
            throw new HostIdInInvitedUserIdsException();
        }

        /**
         * `초대 목록`의 사이즈가 채팅방의 최대 수용 인원을 넘지 않는지 확인합니다.
         * 
         * 호스트도 채팅방에 들어가야 하므로, `+1`을 합니다.
         */
        this.validateChatRoomCapacityForParticipants(inviteeUserIdSet.size + 1)

        /**
         * dto.hostUserId로 유저를 가져옵니다.
         */
        const host = await this.userService.findByIdOrThrow(dto.hostUserId);

        /**
         * `초대 목록`에 있는 유저는 모두 호스트 유저가 FOLLOW 한 유저여야 합니다.
         */
        host.validateTargetIdsAllFollowing(inviteeUserIdSet);

        /**
         * 채팅방을 생성합니다.
         */
        const chatRoom = dto.toEntity();

        /**
         * DB에 변경사항을 저장합니다.
         */
        const savedChatRoom = await this.chatRoomRepository.save(chatRoom);

        return savedChatRoom;
    }

    /**
     * 채팅방이 participantSize 만큼의 인원을 수용할 수 있는지 확인합니다.
     * 
     * 채팅방의 최대 수용 인원은 10명입니다.
     */
    validateChatRoomCapacityForParticipants(participantSize: number) {
        const maximumSize = 10;

        if (participantSize > maximumSize) {
            throw new MaxInvitedIdsException();
        }
    }
}