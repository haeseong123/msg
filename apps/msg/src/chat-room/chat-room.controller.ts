import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";
import { Message } from "@app/msg-core/entities/message/message.entity";
import { User } from "@app/msg-core/entities/user/user.entity";
import { Body, Controller, Get, UseGuards, Post, Delete, Param, ParseIntPipe } from "@nestjs/common";
import { JwtGuard } from "../auth/jwt/guard/jwt.guard";
import { ChatRoomService } from "./chat-room.service";
import { ChatRoomMessageDto } from "./dto/chat-room-message.dto";
import { ChatRoomSaveDto } from "./dto/chat-room-save.dto";
import { ChatRoomUserDto } from "./dto/chat-room-user.dto";
import { ChatRoomDto } from "./dto/chat-room.dto";
import { UserGuard } from "../user/guard/user.guard";
import { ChatRoomGuard } from "./guard/chat-room.guard";

@UseGuards(JwtGuard, UserGuard)
@Controller('users/:userId/chat-rooms')
export class ChatRoomController {
    constructor(private chatRoomService: ChatRoomService) { }

    @Get()
    async findAll(
        @Param('userId', ParseIntPipe) userId: number,
    ): Promise<ChatRoomDto[]> {
        const chatRooms = await this.chatRoomService.findAll(userId);
        return chatRooms.map(cr => this.toChatRoomDto(cr));
    }

    @Post()
    async save(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() dto: ChatRoomSaveDto,
    ): Promise<ChatRoomSaveDto> {
        const chatRoom = await this.chatRoomService.save(userId, dto);
        return this.toChatRoomSaveDto(chatRoom);
    }

    @UseGuards(ChatRoomGuard)
    @Delete(':chatRoomId')
    async leave(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('chatRoomId', ParseIntPipe) chatRoomId: number,
    ): Promise<void> {
        return await this.chatRoomService.leaveChatRoom(chatRoomId, userId);
    }

    private toChatRoomDto(chatRoom: ChatRoom): ChatRoomDto {
        const chatRoomUserDtos = chatRoom.userChatRooms.map(ucr => this.toChatRoomUserDto(ucr.user));
        const chatRoomMessageDtos = chatRoom.messages.map(msg => this.toChatRoomMessageDto(msg));

        return new ChatRoomDto(
            chatRoom.id,
            chatRoom.name,
            chatRoomUserDtos,
            chatRoomMessageDtos,
        );
    }

    private toChatRoomUserDto(user: User): ChatRoomUserDto {
        return new ChatRoomUserDto(
            user.id,
            user.email,
            user.nickname
        );
    }

    private toChatRoomMessageDto(message: Message): ChatRoomMessageDto {
        return new ChatRoomMessageDto(
            message.id,
            message.senderId,
            message.content,
            message.sentAt,
        );
    }

    private toChatRoomSaveDto(chatRoom: ChatRoom): ChatRoomSaveDto {
        return new ChatRoomSaveDto(
            chatRoom.id,
            chatRoom.name,
            chatRoom.userChatRooms.map(ucr => ucr.userId),
        );
    }
}