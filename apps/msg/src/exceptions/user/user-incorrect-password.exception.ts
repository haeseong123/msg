import { UnauthorizedException } from "@nestjs/common";
import { ErrorMessage } from "../error-message";

export class UserIncorrectPasswordException extends UnauthorizedException {
    constructor() {
        super(ErrorMessage.LOGIN_INPUT_INVALID_PASSWORD)
    }
}