import { NotFoundException } from "@nestjs/common";
import { ErrorMessage } from "../error-message";

export class UserIncorrectEmailException extends NotFoundException {
    constructor() {
        super(ErrorMessage.LOGIN_INPUT_INVALID_EMAIL)
    }
}