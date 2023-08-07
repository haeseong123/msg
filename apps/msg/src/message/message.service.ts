import { Message } from "@app/msg-core/entities/message/message.entity";
import { Injectable } from "@nestjs/common";
import { MessageDto } from "./dto/message.dto";
import { MessageRepository } from "./message.repository";
import { MandatoryArgumentNullException } from "../common/exception/mandatory-argument-null.exception";

@Injectable()
export class MessageService {
    constructor(private readonly messageRepository: MessageRepository) { }

    async findAllByChatRoomIdAndSenderId(chatRoomId: number, senderId: number): Promise<Message[]> {
        return this.messageRepository.findAllByChatRoomIdAndSenderId(chatRoomId, senderId);
    }

    async save(messageDto: MessageDto): Promise<Message> {
        return this.messageRepository.save(messageDto.toEntity());
    }

    async update(messageDto: MessageDto): Promise<void> {
        if (!messageDto.id) {
            throw new MandatoryArgumentNullException()
        }

        return this.messageRepository.update(messageDto.id, { content: messageDto.content });
    }

    async delete(id: number): Promise<void> {
        return await this.messageRepository.delete(id);
    }

    async isOwnerTheMessage(id: number, senderId: number): Promise<boolean> {
        return await this.messageRepository.isOwnerTheMessage(id, senderId);
    }
}