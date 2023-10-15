import { WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway {

  //   /**
  //    * IO -> Namespace -> Room -> Socket
  //    * 
  //    * IO는 서버 (server)
  //    * 
  //    * Namespace는 채널같은 개념 (e.g., 1채널 2채널, ...)
  //    * 
  //    * Room은 해당 채널 안에 있는 채팅방 개념 (e.g., 1채널 12번 채팅방, 3채널 2번 채팅방, ...)
  //    * 
  //    * Socket은 Room에 참여중인 사용자의 개념
  //    * socket은 여러 Room에 참여할 수 있습니다.
  //    */
  //   @WebSocketServer()
  //   nsp: Namespace;

  //   /**
  //    * 소켓 연결이 수립될 때 해당 메서드가 호출됩니다.
  //    * 
  //    * - client를 특정 채팅방에 JOIN 시킵니다.
  //    * - 해당 채팅방에 있는 모든 사용자에게 'XXX님이 입장했습니다.'를 전송합니다.
  //    */
  //   async handleConnection(client: SocketWithAuthAndChatRoomId, ...args: any[]) {
  //     // HTTP API를 사용하여 해당 채팅방을 가져온다.
  //     // 해당 채팅방에 해당 client가 존재하는지 확인한다.
  //     //    만약 존재하지 않으면 연결을 끊어버린다.
  //     // 그 후
  //     // client.join(채팅방) /** 채팅방 입장 */
  //     // this.nsp.to(채팅방).emit('newbie', `${client.nickname}님이 입장했습니다.`) /** 입장 메시지 전송 */

  //     /** 
  //      * 이거 responseEntity에 담겨져 올텐데..
  //      * 
  //      * 요청보내는 URL 관리하는 것도 필요하겠고, 안에 있는거 뜯어오는 것도 필요하겠고...
  //      * 요청 보내는 것도 필요하겠고..
  //      * 이거 받아오는 로직 필요하겠네 200이면 속에 있는 data 받아오면 되지만, err나면..?
  //      * 
  //      * 
  //      * MsgHttpApiServer class를 만들고
  //      * 
  //      * 모든 요청을 메서드로 제공한다.
  //      * 
  //      * 해당 메서드의 본문에는 실제 http api server로 요청을 보내는 로직이 있고
  //      * 
  //      * 값을 받아올 때 data만 리턴하도록 한다.
  //      * 
  //      * 만약 err가 발생하면 null을 리턴하거나 하자.
  //      */
  //     // `/users/:userId/chat-rooms/:chatRoomId`


  //     /**
  //      * 지금은 controller, service, repository 코드가 마구 섞여 있는데,
  //      * 
  //      * 나중에 나눠야 함
  //      */

  //     const findChatRoomByIdDto = new FindChatRoomByIdDto(client.id, client.chatRoomId);
  //     const chatRoom = await this.httpApiServer.findChatRoomById(findChatRoomByIdDto);

  //     if (!chatRoom) {
  //       client.disconnect(true);
  //       return;
  //     }

  //     const roomName = client.chatRoomId;
  //     /**
  //      * client를 채팅방에 입장시킵니다.
  //      */
  //     client.join(roomName);

  //     /**
  //      * client가 입장했음을 해당 채팅방에 있는 모든 사용자에게 알립니다.
  //      */
  //     client.to(roomName).emit("newbie", `${client.email}님이 입장했습니다.`);
  //   }

  //   /**
  //    * postMessage 이벤트를 수신하면 해당 메서드가 호출됩니다.
  //    * 
  //    * - HTTP API를 사용하여 해당 메시지를 DB에 저장합니다.
  //    * - 해당 채팅방에 있는 모든 사용자에게 해당 메시지를 전송합니다.
  //    */
  //   @SubscribeMessage("postMessage")
  //   async onPostMessage(
  //     @ConnectedSocket() client: SocketWithAuthAndChatRoomId,
  //     @MessageBody() messageDto: MessageDto,
  //   ) {
  //     const roomName = client.chatRoomId;

  //     const message = await this.httpApiServer.postMessage(messageDto);
  //     this.nsp.to(roomName).emit("newMessage", MessageConverter.toMessageDto(message));
  //   }

  //   /**
  //    * 소켓 연결이 끊길 때 해당 메서드가 호출됩니다.
  //    * 
  //    * - 해당 채팅방에 있는 모든 사용자에게 'XXX님이 퇴장했습니다.'를 전송합니다.
  //    */
  //   handleDisconnect(
  //     @ConnectedSocket() client: SocketWithAuthAndChatRoomId,
  //   ) {
  //     const roomName = this.getRoomNameByChatRoomId(client.chatRoomId);

  //     client.to(roomName).emit("leave", `${client.email}님이 퇴장했습니다.`);
  //   }
}
