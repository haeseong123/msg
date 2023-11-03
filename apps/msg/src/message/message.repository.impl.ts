import { Message } from '@app/msg-core/entities/message/message.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { MessageRepository } from './message.repository';

@Injectable()
export class MessageRepositoryImpl
  extends Repository<Message>
  implements MessageRepository
{
  constructor(dataSource: DataSource) {
    super(Message, dataSource.createEntityManager());
  }

  async findAllByChatRoomId(chatRoomId: number): Promise<Message[]> {
    const messages = await this.findBy({
      sentChatRoomId: chatRoomId,
    });

    return messages;
  }

  async removeAll(entities: Message[]): Promise<Message[]> {
    const removedMessages = await this.remove(entities);

    return removedMessages;
  }
}
