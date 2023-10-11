// import { Logger } from "@nestjs/common";
// import { SocketWithAuthAndChatRoomId } from "../socket-types";

// // 이거를 middleware로 처리하는 것이 옳은가?
// export const SocketChatRoomIdMiddleware =
//     (logger: Logger) =>
//         async (socket: SocketWithAuthAndChatRoomId, next) => {
//             const chatRoomId = +socket.handshake.query["chat-room-id"];
//             if (Number.isInteger(chatRoomId)) {
//                 socket.chatRoomId = chatRoomId;
//                 next();
//             } else {
//                 const errorMessage = "chatRoomId must be integer";
//                 socket.disconnect(true);
//                 logger.error(errorMessage);
//                 next(new Error(errorMessage));
//             }
//         }