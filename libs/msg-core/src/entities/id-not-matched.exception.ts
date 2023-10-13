import { ErrorMessage } from "@app/msg-core/common/exception/error-message";
import { BadRequestException } from "@nestjs/common";

export class IdNotMatchedException extends BadRequestException {
    constructor() {
        super(ErrorMessage.USER_NOT_IN_CHAT_ROOM)
    }
}