import { UnauthorizedException } from "@nestjs/common";
import { ErrorMessage } from "../../exceptions/error-message";

export class UserIncorrectEmailException extends UnauthorizedException {
    constructor() {
        super(ErrorMessage.LOGIN_INPUT_INVALID_EMAIL)
    }
}