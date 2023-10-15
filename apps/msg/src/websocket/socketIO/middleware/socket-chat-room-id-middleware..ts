import { Logger } from "@nestjs/common";
import { SocketWithAuthAndChatRoomId } from "../socket-types";

// 이거를 middleware로 처리하는 것이 옳은가?
export const SocketChatRoomIdMiddleware =
    (logger: Logger) =>
        async (socket: SocketWithAuthAndChatRoomId, next) => {
            const queryChatRoomId = socket.handshake.query["chat-room-id"]
            const chatRoomId = queryChatRoomId ? +queryChatRoomId : '';
            if (Number.isInteger(chatRoomId) && typeof chatRoomId === 'number') {
                socket.chatRoomId = chatRoomId;
                next();
            } else {
                const errorMessage = "chatRoomId must be integer";
                socket.disconnect(true);
                logger.error(errorMessage);
                next(new Error(errorMessage));
            }
        }