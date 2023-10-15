import { JwtGuard } from "@app/msg-core/jwt/guard/jwt.guard";
import { UseGuards, Controller, Post, Body, Delete, ParseIntPipe, Param } from "@nestjs/common";
import { UserGuard } from "../../user/guard/user.guard";
import { ChatRoomParticipantService } from "./chat-room-participant.service";
import { ChatRoomParticipantDto } from "./dto/chat-room-participant.dto";
import { ChatRoomParticipantSaveDto } from "./dto/chat-room-participant-save.dto";
import { ChatRoomParticipantRemoveDto } from "./dto/chat-room-participant-remove.dto";

@UseGuards(JwtGuard, UserGuard)
@Controller('users/:userId/chat-rooms/:chatRoomId/participants')
export class ChatRoomParticipantController {
    constructor(private chatRoomParticipantService: ChatRoomParticipantService) { }

    /**
     * 채팅방에 다른 유저를 초대합니다.
     */
    @Post()
    async save(
        @Body() dto: ChatRoomParticipantSaveDto,
    ): Promise<ChatRoomParticipantDto> {
        const savedParticipant = await this.chatRoomParticipantService.save(dto);

        return ChatRoomParticipantDto.of(savedParticipant);
    }
    
    /**
     * 채팅방을 나갑니다.
     */
    @Delete(':id')
    async leave(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('chatRoomId', ParseIntPipe) chatRoomId: number,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<ChatRoomParticipantDto> {
        const dto = new ChatRoomParticipantRemoveDto(id, userId, chatRoomId);
        const leavedParticipant = await this.chatRoomParticipantService.remove(dto);

        return ChatRoomParticipantDto.of(leavedParticipant);
    }
}