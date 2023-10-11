import { Message } from "@app/msg-core/entities/message/message.entity";
import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { MessageRepository } from "./message.repository";
import { FindAllMessageInfoDto } from "./dto/find-all-message-info.dto";
import { ChatRoomService } from "../chat-room/chat-room.service";
import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";
import { MessageSaveDto } from "./dto/message-save.dto";

@Injectable()
export class MessageService {
    constructor(
        private readonly messageRepository: MessageRepository,
        /**
         * @deprecated 의존성 순환 문제 해결 필요
         */
        @Inject(forwardRef(() => ChatRoomService))
        private readonly chatRoomService: ChatRoomService,
    ) { }

    async findAllByChatRoomIdAndSenderId(dto: FindAllMessageInfoDto): Promise<Message[]> {
        /**
         * dto.chatRoomId에 해당되는 chatroom이 존재하는지 확인합니다.
         */
        const chatRoom = await this.chatRoomService.findByIdOrThrow(dto.chatRoomId);

        /**
         * dto.userId가 chatRoom에 참여중인지 확인합니다.
         */
        this.checkUserInChatRoom(chatRoom, dto.userId);

        /**
         * message를 조회합니다.
         */
        const messages = await this.messageRepository.findAllByChatRoomId(dto.chatRoomId);

        return messages;
    }

    async save(dto: MessageSaveDto): Promise<Message> {
        /**
         * dto.sentChatRoomId에 해당되는 chatRoom이 존재하는지 확인합니다.
         */
        const chatRoom = await this.chatRoomService.findByIdOrThrow(dto.sentChatRoomId);

        /**
         * dto.sentUserId가 chatRoom에 참여중인지 확인합니다.
         */
        this.checkUserInChatRoom(chatRoom, dto.sentUserId);

        /**
         * message를 저장합니다.
         */
        const savedMessage = await this.messageRepository.save(dto.toEntity());

        return savedMessage
    }

    async removeAllByChatRoomId(chatRoomId: number): Promise<Message[]> {
        const messages = await this.messageRepository.findAllByChatRoomId(chatRoomId);
        const removedMessages = await this.messageRepository.removeAll(messages);

        return removedMessages;
    }

    private async checkUserInChatRoom(chatRoom: ChatRoom, userId: number) {
        const isUserInChatRoom = chatRoom.participants.some(p => p.userId === userId);

        if (!isUserInChatRoom) {
            throw new Error("채팅방에 참여중인 유저가 아닙니다.");
        }
    }
}