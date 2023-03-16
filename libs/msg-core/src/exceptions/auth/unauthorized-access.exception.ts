import { UnauthorizedException } from "@nestjs/common";
import { ErrorMessage } from "../error-message";

export class UnauthorizedAccessException extends UnauthorizedException {
    constructor() {
        super(ErrorMessage.UNAUTHORIZED);
    }
}