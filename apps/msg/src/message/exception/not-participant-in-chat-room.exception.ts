import { BadRequestException } from "@nestjs/common";
import { ErrorMessage } from "apps/msg/src/common/exception/error-message";

export class NotParticipantInChatRoomException extends BadRequestException {
    constructor() {
        super(ErrorMessage.NOT_PARTICIPANT_IN_CHAT_ROOM);
    }
}