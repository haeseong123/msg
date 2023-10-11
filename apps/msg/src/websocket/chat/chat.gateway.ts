// import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
// import { Namespace } from 'socket.io';
// import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
// import { ChatGuard } from './guard/chat.guard';
// import { ChatMessageGuard } from './guard/chat-message.guard';
// import { ChatRoomService } from '../../chat-room/chat-room.service';
// import { ArgumentInvalidException } from '../../common/exception/argument-invalid.exception';
// import { MessageDto } from '../../message/dto/message.dto';
// import { MessageConverter } from '../../message/message-converter';
// import { MessageService } from '../../message/message.service';
// import { SocketWithAuthAndChatRoomId } from '../socketIO/socket-types';

// @WebSocketGateway({ namespace: 'chat' })
// // 이거 정리해야 됨
// @UsePipes(new ValidationPipe({
//     transformOptions: {
//         enableImplicitConversion: true
//     },
//     whitelist: true,
//     forbidNonWhitelisted: true,
//     transform: true,
//     exceptionFactory: (_error) => new ArgumentInvalidException()
// }))
// @UseGuards(ChatGuard)
// export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
//     constructor(
//         private readonly chatRoomService: ChatRoomService,
//         private readonly messageService: MessageService
//     ) { }

//     // IO -> NameSpace -> Room -> Socket
//     @WebSocketServer()
//     nsp: Namespace

//     // 소켓이 연결될 때 실행
//     async handleConnection(client: SocketWithAuthAndChatRoomId, ...args: any[]) {
//         // 채팅방에 속한 유저인지 확인
//         const chatRoom = await this.chatRoomService.findOne(client.chatRoomId, client.sub)
//         if (!chatRoom) {
//             client.disconnect(true)
//             return
//         }

//         // 해당 채팅방(room)에 입장시킴
//         const roomName = this.getRoomNameByChatRoomId(client.chatRoomId);
//         client.join(roomName);

//         // 해당 유저를 제외한 room의 다른 모든 유저에게 아래 메시지 발송
//         //  "XXX님이 입장했습니다."
//         client.to(roomName).emit("newbie", `${client.email}님이 입장했습니다.`)

//         // 해당 유저에게만 해당 채팅방의 모든 메시지 발송
//         client.emit("messages", chatRoom.messages.map(m => MessageConverter.toMessageDto(m)))
//     }

//     // 메시지 전송
//     @SubscribeMessage("postMessage")
//     async onPostMessage(
//         @ConnectedSocket() client: SocketWithAuthAndChatRoomId,
//         @MessageBody() messageDto: MessageDto
//     ) {
//         const roomName = this.getRoomNameByChatRoomId(client.chatRoomId);

//         // DB에 메시지 저장
//         const message = await this.messageService.save(messageDto);
//         // room에 메시지 전송
//         this.nsp.to(roomName).emit("newMessage", MessageConverter.toMessageDto(message));
//     }

//     // 메시지 수정
//     @SubscribeMessage("updateMessage")
//     @UseGuards(ChatMessageGuard)
//     async onUpdateMessage(
//         @ConnectedSocket() client: SocketWithAuthAndChatRoomId,
//         @MessageBody() messageDto: MessageDto
//     ) {
//         const roomName = this.getRoomNameByChatRoomId(client.chatRoomId);

//         // DB에 있는 메시지 업데이트
//         await this.messageService.update(messageDto);
//         // room에 해당 내용 전달
//         this.nsp.to(roomName).emit("updateMessage", messageDto);
//     }

//     // 메시지 삭제
//     @SubscribeMessage("deleteMessage")
//     @UseGuards(ChatMessageGuard)
//     async onDeleteMessage(
//         @ConnectedSocket() client: SocketWithAuthAndChatRoomId,
//         @MessageBody() messageDto: MessageDto
//     ) {
//         const roomName = this.getRoomNameByChatRoomId(client.chatRoomId);

//         // DB에 있는 메시지 삭제
//         this.messageService.delete(messageDto.id);
//         // room에 해당 내용 전달
//         this.nsp.to(roomName).emit("deleteMessage", messageDto)
//     }

//     // 소켓 연결이 끊길 때 실행됨
//     handleDisconnect(
//         @ConnectedSocket() client: SocketWithAuthAndChatRoomId,
//     ) {
//         const roomName = this.getRoomNameByChatRoomId(client.chatRoomId);
//         client.to(roomName).emit("leave", `${client.email}님이 퇴장했습니다.`);
//     }

//     private getRoomNameByChatRoomId(chatRoomId): string {
//         return `chatroom/${chatRoomId}`
//     }
// }