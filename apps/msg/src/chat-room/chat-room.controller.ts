import { Body, Controller, Get, UseGuards, Post, Delete, Param, ParseIntPipe } from "@nestjs/common";
import { JwtGuard } from "../auth/jwt/guard/jwt.guard";
import { ChatRoomService } from "./chat-room.service";
import { ChatRoomSaveDto } from "./dto/chat-room-save.dto";
import { ChatRoomDto } from "./dto/chat-room.dto";
import { UserGuard } from "../user/guard/user.guard";

@UseGuards(JwtGuard, UserGuard)
@Controller('users/:userId/chat-rooms')
export class ChatRoomController {
    constructor(private chatRoomService: ChatRoomService) { }

    @Get()
    async findAllByUserId(
        @Param('userId', ParseIntPipe) userId: number,
    ): Promise<ChatRoomDto[]> {
        const chatRooms = await this.chatRoomService.findAllByUserId(userId);

        return chatRooms.map(cr => ChatRoomDto.of(cr));
    }

    @Post()
    async save(
        @Body() dto: ChatRoomSaveDto
    ): Promise<ChatRoomDto> {
        const savedChatRoom = await this.chatRoomService.save(dto);

        return ChatRoomDto.of(savedChatRoom);
    }

    @Delete(':id')
    async leave(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<ChatRoomDto> {
        const leftCharRoom = await this.chatRoomService.leaveChatRoom(id, userId);

        return ChatRoomDto.of(leftCharRoom);
    }
}