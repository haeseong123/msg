import { ErrorMessage } from "@app/msg-core/exception/error.message";
import { NotFoundException } from "@nestjs/common";

export class UserIncorrectEmailException extends NotFoundException {
    constructor() {
        super(ErrorMessage.LOGIN_INPUT_INVALID_EMAIL)
    }
}