import { ChatRoomParticipant } from '@app/msg-core/entities/chat-room/chat-room-participant/chat-room-participant.entity';
import { Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class ChatRoomParticipantSaveDto {
  @Expose({ name: 'chatRoomId' })
  @IsNumber()
  private readonly _chatRoomId: number;

  @Expose({ name: 'inviterUserId' })
  @IsNumber()
  private readonly _inviterUserId: number;

  @Expose({ name: 'inviteeUserId' })
  @IsNumber()
  private readonly _inviteeUserId: number;

  constructor(
    chatRoomId: number,
    inviterUserId: number,
    inviteeUserId: number,
  ) {
    this._chatRoomId = chatRoomId;
    this._inviterUserId = inviterUserId;
    this._inviteeUserId = inviteeUserId;
  }

  toEntity(): ChatRoomParticipant {
    return ChatRoomParticipant.of(this._chatRoomId, this._inviteeUserId);
  }

  get chatRoomId(): number {
    return this._chatRoomId;
  }

  get inviterUserId(): number {
    return this._inviterUserId;
  }

  get inviteeUserId(): number {
    return this._inviteeUserId;
  }
}
