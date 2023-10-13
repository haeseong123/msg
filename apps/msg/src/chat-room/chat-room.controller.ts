import { Body, Controller, Get, UseGuards, Post, Delete, Param, ParseIntPipe } from "@nestjs/common";
import { ChatRoomService } from "./chat-room.service";
import { ChatRoomSaveDto } from "./dto/chat-room-save.dto";
import { ChatRoomDto } from "./dto/chat-room.dto";
import { UserGuard } from "../user/guard/user.guard";
import { JwtGuard } from "@app/msg-core/jwt/guard/jwt.guard";
import { ChatRoomWithMessagesSearchDto } from "./dto/chat-room-with-messages-search.dto";
import { ChatRoomWithMessagesDto } from "./dto/chat-room-with-messages.dto";

@UseGuards(JwtGuard, UserGuard)
@Controller('users/:userId/chat-rooms')
export class ChatRoomController {
    constructor(private chatRoomService: ChatRoomService) { }

    /**
     * 채팅방 전부 가져오기
     */
    @Get()
    async findAllByUserId(
        @Param('userId', ParseIntPipe) userId: number,
    ): Promise<ChatRoomDto[]> {
        const chatRooms = await this.chatRoomService.findAllByUserId(userId);

        return chatRooms.map(cr => ChatRoomDto.of(cr));
    }

    /**
     * 채팅방 상세 가져오기
     */
    @Get(':id')
    async findByIdWithMessages(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<ChatRoomWithMessagesDto> {
        const dto = new ChatRoomWithMessagesSearchDto(userId, id);
        const chatRoomWithMessagesDto = this.chatRoomService.findChatRoomWithMessages(dto);

        return chatRoomWithMessagesDto;
    }

    /**
     * 채팅방 생성하기
     */
    @Post()
    async save(
        @Body() dto: ChatRoomSaveDto
    ): Promise<ChatRoomDto> {
        const savedChatRoom = await this.chatRoomService.save(dto);

        return ChatRoomDto.of(savedChatRoom);
    }
}