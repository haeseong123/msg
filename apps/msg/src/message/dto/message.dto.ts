import { Message } from '@app/msg-core/entities/message/message.entity';
import { Expose } from 'class-transformer';

export class MessageDto {
  @Expose({ name: 'id' })
  private readonly _id: number;

  @Expose({ name: 'sentUserId' })
  private readonly _sentUserId: number;

  @Expose({ name: 'sentChatRoomId' })
  private readonly _sentChatRoomId: number;

  @Expose({ name: 'content' })
  private readonly _content: string;

  constructor(
    id: number,
    sentUserId: number,
    sentChatRoomId: number,
    content: string,
  ) {
    this._id = id;
    this._sentUserId = sentUserId;
    this._sentChatRoomId = sentChatRoomId;
    this._content = content;
  }

  static of(message: Message): MessageDto {
    return new MessageDto(
      message.id,
      message.sentUserId,
      message.sentChatRoomId,
      message.content,
    );
  }
}
