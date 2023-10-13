import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace } from 'socket.io';

/**
 * WebSocket이 책임지는 기능
 *    채팅방 입장
 *      - Get : http:~~~/users/:userId/chatrooms
 *    채팅방 퇴장
 *    메시지 전송
 */
@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway {

  // IO -> Namespace -> Room -> Socket
  @WebSocketServer()
  nsp: Namespace;

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
