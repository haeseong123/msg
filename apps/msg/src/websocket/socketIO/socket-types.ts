import { TokenPayload } from "@app/msg-core/jwt/token-payload";
import { Socket } from "socket.io";

export type SocketWithAuth = Socket & TokenPayload
export type SocketWithAuthAndChatRoomId = SocketWithAuth & { chatRoomId: number }
