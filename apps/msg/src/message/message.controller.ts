import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { UserGuard } from '../user/guard/user.guard';
import { MessageDto } from './dto/message.dto';
import { MessageService } from './message.service';
import { MessageSaveGuard } from './guard/message-save.guard';
import { MessageSaveDto } from './dto/message-save.dto';
import { JwtGuard } from '@app/msg-core/jwt/guard/jwt.guard';

@UseGuards(JwtGuard, UserGuard)
@Controller('users/:userId/chat-rooms/:chatRoomId/messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  /**
   * 메시지 저장
   */
  @Post()
  @UseGuards(MessageSaveGuard)
  async save(@Body() dto: MessageSaveDto): Promise<MessageDto> {
    const savedMessage = await this.messageService.save(dto);

    return MessageDto.of(savedMessage);
  }
}
