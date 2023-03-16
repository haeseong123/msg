import { NotFoundException } from "@nestjs/common";
import { ErrorMessage } from "../error-message";

export class UserIncorrectPasswordException extends NotFoundException {
    constructor() {
        super(ErrorMessage.LOGIN_INPUT_INVALID_PASSWORD)
    }
}