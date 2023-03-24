import { Body, Controller, Get, UseGuards, Post, Delete, Param, ParseIntPipe } from "@nestjs/common";
import { CurrentUser } from "../auth/decorator/current-user.decorator";
import { UnauthorizedAccessException } from "../auth/exceptions/unauthorized-access.exception";
import { JwtGuard } from "../auth/jwt/guard/jwt.guard";
import { ChatRoomService } from "./chat-room.service";
import { ChatRoomMessageDto } from "./dto/chat-room-message.dto";
import { ChatRoomSaveDto } from "./dto/chat-room-save.dto";
import { ChatRoomUserDto } from "./dto/chat-room-user.dto";
import { ChatRoomDto } from "./dto/chat-room.dto";

@UseGuards(JwtGuard)
@Controller('chat-rooms')
export class ChatRoomController {
    constructor(private chatRoomService: ChatRoomService) { }

    @Get()
    async findAll(
        @CurrentUser('sub') sub: number
    ): Promise<ChatRoomDto[]> {
        const chatRooms = await this.chatRoomService.findAll(sub);
        return chatRooms.map(cr => new ChatRoomDto(
            cr.id,
            cr.name,
            cr.userChatRooms.map(ucr => new ChatRoomUserDto(ucr.user.id, ucr.user.email, ucr.user.nickname)),
            cr.messages.map(msg => new ChatRoomMessageDto(msg.id, msg.senderId, msg.content, msg.sentAt)),
        ));
    }

    @Post()
    async save(
        @CurrentUser('sub') sub: number,
        @Body() dto: ChatRoomSaveDto,
    ): Promise<ChatRoomSaveDto> {
        const chatRoom = await this.chatRoomService.save(sub, dto);
        return ChatRoomSaveDto.of(
            chatRoom.id,
            chatRoom.name,
            chatRoom.userChatRooms.map(ucr => ucr.userId)
        );
    }

    @Delete(':id/user/:userId')
    async delete(
        @CurrentUser('sub') sub: number,
        @Param('id', ParseIntPipe) id: number,
        @Param('userId', ParseIntPipe) userId: number,
    ) {
        if (sub !== userId) {
            throw new UnauthorizedAccessException();
        }

        await this.chatRoomService.delete(id, userId);
        return;
    }
}