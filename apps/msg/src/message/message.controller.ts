import { Controller, Get, Post, Param, ParseIntPipe, UseGuards, Body } from "@nestjs/common";
import { JwtGuard } from "../auth/jwt/guard/jwt.guard";
import { UserGuard } from "../user/guard/user.guard";
import { MessageDto } from "./dto/message.dto";
import { MessageService } from "./message.service";
import { FindAllMessageInfoDto } from "./dto/find-all-message-info.dto";
import { MessageSaveGuard } from "./guard/message-save.guard";
import { MessageSaveDto } from "./dto/message-save.dto";

@UseGuards(JwtGuard, UserGuard)
@Controller('users/:userId/chat-rooms/:chatRoomId/messages')
export class MessageController {
    constructor(private readonly messageService: MessageService) { }
    @Get()
    async findAllByChatRoomId(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('chatRoomId', ParseIntPipe) chatRoomId: number,
    ): Promise<MessageDto[]> {
        const dto = new FindAllMessageInfoDto(userId, chatRoomId);
        const messages = await this.messageService.findAllByChatRoomIdAndSenderId(dto);

        return messages.map(m => MessageDto.of(m));
    }

    @Post()
    @UseGuards(MessageSaveGuard)
    async save(
        @Body() dto: MessageSaveDto,
    ): Promise<MessageDto> {
        const savedMessage = await this.messageService.save(dto);

        return MessageDto.of(savedMessage);
    }
}