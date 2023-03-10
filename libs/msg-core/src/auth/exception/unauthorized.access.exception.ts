import { ErrorMessage } from "@app/msg-core/exception/error.message";
import { UnauthorizedException } from "@nestjs/common";

export class UnauthorizedAccessException extends UnauthorizedException {
    constructor() {
        super(ErrorMessage.UNAUTHORIZED);
    }
}