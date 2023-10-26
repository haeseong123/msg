import { Message } from '@app/msg-core/entities/message/message.entity';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { ChatRoomService } from '../chat-room/chat-room.service';
import { MessageSaveDto } from './dto/message-save.dto';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
    /**
     * @deprecated 의존성 순환 문제 해결 필요
     *
     * 어떻게???
     */
    @Inject(forwardRef(() => ChatRoomService))
    private readonly chatRoomService: ChatRoomService,
  ) {}

  /**
   * chatRoomId에 해당되는 채팅방에 보낸 모든 메시지를 가져옵니다.
   */
  async findAllByChatRoomId(chatRoomId: number): Promise<Message[]> {
    const messages = await this.messageRepository.findAllByChatRoomId(
      chatRoomId,
    );

    return messages;
  }

  /**
   * 메시지를 저장합니다.
   */
  async save(dto: MessageSaveDto): Promise<Message> {
    /**
     * dto.chatRoomId에 해당되는 chatroom을 가져옵니다.
     */
    const chatRoom = await this.chatRoomService.findByIdOrThrow(
      dto.sentChatRoomId,
    );

    /**
     * dto.sentUserId가 chatRoom에 참여중인지 확인합니다.
     */
    chatRoom.findParticipantByUserIdOrThrow(dto.sentUserId);

    /**
     * message를 생성합니다.
     */
    const message = dto.toEntity();

    /**
     * 변경사항을 DB에 저장합니다.
     */
    const savedMessage = await this.messageRepository.save(message);

    return savedMessage;
  }

  /**
   * chatRoomId에 해당되는 채팅방에 보낸 모든 메시지를 삭제합니다.
   */
  async removeAllByChatRoomId(chatRoomId: number): Promise<Message[]> {
    /**
     * chatRoomId에 해당되는 채팅방에 보낸 모든 메시지를 가져옵니다.
     */
    const messages = await this.messageRepository.findAllByChatRoomId(
      chatRoomId,
    );

    /**
     * 해당 메시지를 전부 삭제합니다.
     */
    const removedMessages = await this.messageRepository.removeAll(messages);

    return removedMessages;
  }
}
