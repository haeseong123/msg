import { UnauthorizedException } from "@nestjs/common";
import { ErrorMessage } from "../../common/exception/error-message";

export class UnauthorizedAccessException extends UnauthorizedException {
    constructor() {
        super(ErrorMessage.UNAUTHORIZED);
    }
}