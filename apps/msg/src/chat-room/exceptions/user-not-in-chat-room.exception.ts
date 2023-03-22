import { BadRequestException } from "@nestjs/common";
import { ErrorMessage } from "../../exceptions/error-message";

export class UserNotInChatRoomException extends BadRequestException {
    constructor() {
        super(ErrorMessage.USER_NOT_IN_CHAT_ROOM)
    }
}