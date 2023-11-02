import { Message } from '@app/msg-core/entities/message/message.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class MessageRepositoryImpl extends Repository<Message> {
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
