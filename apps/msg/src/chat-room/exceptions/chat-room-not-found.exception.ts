import { NotFoundException } from "@nestjs/common";
import { ErrorMessage } from "apps/msg/src/common/exception/error-message";

export class ChatRoomNotFoundException extends NotFoundException {
    constructor() {
        super(ErrorMessage.CHAT_ROOM_NOT_FOUNDED);
    }
}