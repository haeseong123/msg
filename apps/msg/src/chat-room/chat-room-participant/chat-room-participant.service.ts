import { ChatRoomParticipant } from "@app/msg-core/entities/chat-room/chat-room-participant/chat-room-participant.entity";
import { ChatRoomService } from "../chat-room.service";
import { ChatRoomParticipantSaveDto } from "./dto/chat-room-participant-save.dto";
import { ChatRoomParticipantRemoveDto } from "./dto/chat-room-participant-remove.dto";
import { TransactionService } from "../../common/database/transaction/transaction-service";
import { MessageService } from "../../message/message.service";
import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { UserService } from "../../user/user.service";

@Injectable()
export class ChatRoomParticipantService {
    constructor(
        private chatRoomService: ChatRoomService,
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

    /**
     * 특정 채팅방에 유저를 한 명 초대합니다.
     */
    async save(dto: ChatRoomParticipantSaveDto): Promise<ChatRoomParticipant> {
        /**
         * dto.inviterUserId로 유저를 가져옵니다.
         * 
         * dto.chatRoomId로 chatRoom을 가져옵니다.
         */
        const [inviter, chatRoom] = await Promise.all([
            this.userService.findByIdOrThrow(dto.inviterUserId),
            this.chatRoomService.findByIdOrThrow(dto.chatRoomId),
        ]);

        /**
         * inviter가 invitee를 FOLLOW하고 있는지 확인합니다.
         */
        inviter.validateTargetIdsAllFollowing([dto.inviteeUserId]);

        /**
         * inviter가 채팅방에 존재하는 사람인지 확인합니다.
         */
        chatRoom.findParticipantByUserIdOrThrow(dto.inviterUserId);

        /**
         * 채팅방에 invitee를 초대할 공간이 남아있는지 확인합니다. 
         */
        this.chatRoomService.validateChatRoomCapacityForParticipants(chatRoom.getParticipantsSize() + 1);

        /**
         * 채팅방에 invitee를 초대합니다.  
         */
        const participantWithoutId = dto.toEntity();
        chatRoom.participate(participantWithoutId);

        /**
         * DB에 변경사항을 저장합니다.
         */
        const updatedChatRoom = await this.chatRoomService.saveByEntity(chatRoom);

        /**
         * updatedChatRoom에서 방금 초대했던 유저를 찾습니다.
         * 
         * dto.toEntity()를 통해 얻어낸 기존의 participant는 
         * 
         * participant.id가 null로 채워져 있기 때문에 이 로직이 필요합니다.
         */
        const savedParticipant = updatedChatRoom.findParticipantByUserIdOrThrow(dto.inviteeUserId);

        return savedParticipant;
    }

    /**
     * 특정 채팅방에 참여중인 유저를 내보냅니다.
     * 
     * 이 기능은 자기 자신만 내보낼 수 있도록 제한됩니다.
     * 
     * (채팅방 나가기 기능)
     */
    async remove(dto: ChatRoomParticipantRemoveDto): Promise<ChatRoomParticipant> {
        /**
         * dto.chatRoomId로 chatRoom을 가져옵니다.
         */
        const chatRoom = await this.chatRoomService.findByIdOrThrow(dto.chatRoomId);

        /**
         * 채팅방의 참여자 중 dto.userId와 같은 userId를 갖는 참여자를 가져옵니다.
         */
        const participant = chatRoom.findParticipantByUserIdOrThrow(dto.userId);

        /**
         * participant.id와 dto.participantId가 같은지 확인합니다. 
         */
        participant.validateId(dto.participantId);

        /**
         * 채팅방에 있는 참여자가 한 명이라면, 채팅방과 해당 채팅방의 모든 메시지를 삭제합니다. 
         * 
         * 그게 아니라면 채팅방에서 참여자를 내보내기만 합니다.
         */
        const participantsSize = chatRoom.getParticipantsSize();
        
        if (participantsSize <= 1) {
            /** 
             * 채팅방과 해당 채팅방의 모든 메시지를 삭제합니다. 
             * */
            const remove = async () => {
                await Promise.all([
                    this.messageService.removeAllByChatRoomId(chatRoom.id),
                    this.chatRoomService.removeByEntity(chatRoom),
                ]);
            };

            await this.transactionService.withTransaction(remove);
        } else {
            /** 
             * 채팅방에서 나갑니다.
             * */
            chatRoom.leaveChatRoom(participant);

            await this.chatRoomService.saveByEntity(chatRoom);
        }

        return participant;
    }
}