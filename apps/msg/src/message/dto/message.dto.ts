import { Message } from "@app/msg-core/entities/message/message.entity";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class MessageDto {
    @IsNumber()
    @IsOptional()
    id?: number;

    @IsNumber()
    @IsNotEmpty()
    senderId: number;

    @IsNumber()
    @IsNotEmpty()
    chatRoomId: number;

    @IsString()
    @IsNotEmpty()
    content: string;

    constructor(
        id: number,
        senderId: number,
        chatRoomId: number,
        content: string,
    ) {
        this.id = id;
        this.senderId = senderId;
        this.chatRoomId = chatRoomId;
        this.content = content;
    }

    toEntity(): Message {
        const message = new Message();
        message.senderId = this.senderId;
        message.chatRoomId = this.chatRoomId;
        message.content = this.content;
        message.sentAt = new Date();
        return message;
    }
}