import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { ChatRoomService } from '../../chat-room/chat-room.service';
import { MessageDto } from '../../message/dto/message.dto';
import { MessageService } from '../../message/message.service';
import { SocketWithAuthAndChatRoomId } from '../socketIO/socket-types';
import { MessageSaveDto } from '../../message/dto/message-save.dto';
import { ChatMessageSaveGuard } from './guard/chat-message-save.guard';
import { instanceToPlain } from 'class-transformer';

/**
 * 지금은 controller, service, repository 코드가 마구 섞여 있는데,
 *
 * 이거 나눠야 함
 */
@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatRoomService: ChatRoomService,
    private readonly messageService: MessageService,
  ) {}

  // IO -> NameSpace -> Room -> Socket
  @WebSocketServer()
  nsp: Namespace;

  /**
   * 소켓 연결이 수립될 때 해당 메서드가 호출됩니다.
   */
  async handleConnection(client: SocketWithAuthAndChatRoomId, ..._args: any[]) {
    /**
     * client가 해당 채팅방에 참여중인지 확인합니다.
     */
    const chatRoom = await this.chatRoomService.findById(client.chatRoomId);
    const participant = chatRoom?.findparticipantByUserId(client.sub);

    if (!chatRoom || !participant) {
      client.disconnect(true);
      return;
    }

    /**
     * client를 채팅방에 입장시킵니다.
     */
    const roomName = client.chatRoomId.toString();
    client.join(roomName);

    /**
     * client가 입장했음을 해당 채팅방에 있는 모든 사용자에게 알립니다.
     */
    this.nsp
      .to(roomName)
      .emit('newbie', `${client.nickname}님이 입장했습니다.`);
  }

  /**
   * postMessage 이벤트를 수신하면 해당 메서드가 호출됩니다.
   */
  @UseGuards(ChatMessageSaveGuard)
  @SubscribeMessage('postMessage')
  async onPostMessage(
    @ConnectedSocket() client: SocketWithAuthAndChatRoomId,
    @MessageBody() messageSaveDto: MessageSaveDto,
  ) {
    /**
     * message를 DB에 저장합니다.
     */
    const message = await this.messageService.save(messageSaveDto);
    const messageDto = MessageDto.of(message);

    /**
     * message를 채팅방에 브로드캐스트합니다.
     */
    const roomName = client.chatRoomId.toString();
    this.nsp.to(roomName).emit('newMessage', instanceToPlain(messageDto));
  }

  /**
   * 소켓 연결이 끊길 때 해당 메서드가 호출됩니다.
   */
  handleDisconnect(@ConnectedSocket() client: SocketWithAuthAndChatRoomId) {
    /**
     * client가 퇴장했음을 해당 채팅방에 있는 모든 사용자에게 알립니다.
     */
    const roomName = client.chatRoomId.toString();
    client.to(roomName).emit('leave', `${client.email}님이 퇴장했습니다.`);
  }
}
