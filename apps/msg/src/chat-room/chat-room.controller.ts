import { Body, Controller, Get, UseGuards, Post, Delete, Param, ParseIntPipe } from "@nestjs/common";
import { CurrentUser } from "../auth/decorator/current-userdecorator";
import { UnauthorizedAccessException } from "../auth/exceptions/unauthorized-access.exception";
import { JwtGuard } from "../auth/jwt/guard/jwt.guard";
import { ChatRoomService } from "./chat-room.service";
import { ChatRoomSaveDto } from "./dto/chat-room-save.dto";
import { ChatRoomSavedResultDto } from "./dto/chat-room-saved-result.dto";
import { ChatRoomDto } from "./dto/chat-room.dto";

@UseGuards(JwtGuard)
@Controller('chat-rooms')
export class ChatRoomController {
    constructor(private chatRoomService: ChatRoomService) { }

    @Get()
    async findChatRooms(
        @CurrentUser('sub') sub: number
    ): Promise<ChatRoomDto[]> {
        return this.chatRoomService.findChatRooms(sub);
    }

    @Post()
    async saveChatRoom(
        @CurrentUser('sub') sub: number,
        @Body() dto: ChatRoomSaveDto,
    ): Promise<ChatRoomSavedResultDto> {
        return this.chatRoomService.save(sub, dto);
    }

    @Delete(':id/user/:userId')
    async deleteUserFromChatRoom(
        @CurrentUser('sub') sub: number,
        @Param('id', ParseIntPipe) id: number,
        @Param('userId', ParseIntPipe) userId: number,
    ) {
        if (sub !== userId) {
            throw new UnauthorizedAccessException();
        }

        return this.chatRoomService.delete(id, userId)
    }
}