import { Body, Controller, Get, UseGuards, Post, Delete, Param, ParseIntPipe } from "@nestjs/common";
import { ChatRoomService } from "./chat-room.service";
import { ChatRoomSaveDto } from "./dto/chat-room-save.dto";
import { ChatRoomDto } from "./dto/chat-room.dto";
import { UserGuard } from "../user/guard/user.guard";
import { ChatRoomLeaveDto } from "./dto/chat-room-leave.dto";
import { JwtGuard } from "@app/msg-core/jwt/guard/jwt.guard";

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
        const dto = new ChatRoomLeaveDto(userId, id);
        const leftChatRoom = await this.chatRoomService.leaveChatRoom(dto);

        return ChatRoomDto.of(leftChatRoom);
    }
}