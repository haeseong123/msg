import { Controller, Delete, Get, Post, Put, Param, ParseIntPipe, UseGuards, Body } from "@nestjs/common";
import { JwtGuard } from "../auth/jwt/guard/jwt.guard";
import { ChatRoomGuard } from "../chat-room/guard/chat-room.guard";
import { UserGuard } from "../user/guard/user.guard";
import { MessageDto } from "./dto/message.dto";
import { MessageGuard } from "./guard/message.guard";
import { MessageService } from "./message.service";
import { ArgumentInvalidException } from "../common/exception/argument-invalid.exception";
import { MessageConverter } from "./message-converter";

@UseGuards(JwtGuard, UserGuard, ChatRoomGuard)
@Controller('users/:userId/chat-rooms/:chatRoomId/messages')
export class MessageController {
    constructor(private readonly messageService: MessageService) { }

    @Get()
    async findAll(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('chatRoomId', ParseIntPipe) chatRoomId: number,
    ): Promise<MessageDto[]> {
        const messages = await this.messageService.findAllByChatRoomIdAndSenderId(chatRoomId, userId);
        return messages.map(m => MessageConverter.toMessageDto(m));
    }

    @Post()
    async save(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('chatRoomId', ParseIntPipe) chatRoomId: number,
        @Body() dto: MessageDto,
    ): Promise<MessageDto> {
        if (dto.id || dto.senderId !== userId || dto.chatRoomId !== chatRoomId) {
            throw new ArgumentInvalidException();
        }

        const message = await this.messageService.save(dto);
        return MessageConverter.toMessageDto(message);
    }

    @UseGuards(MessageGuard)
    @Put(':messageId')
    async update(
        @Param('messageId', ParseIntPipe) messageId: number,
        @Body() messageDto: MessageDto,
    ): Promise<void> {
        if (messageId !== messageDto.id) {
            throw new ArgumentInvalidException();
        }

        return this.messageService.update(messageDto);
    }

    @UseGuards(MessageGuard)
    @Delete(':messageId')
    async delete(
        @Param('messageId', ParseIntPipe) messageId: number,
    ): Promise<void> {
        return this.messageService.delete(messageId);
    }
}