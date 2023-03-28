import { UnauthorizedException } from "@nestjs/common";
import { ErrorMessage } from "../../common/exception/error-message";

export class TokenExpiredException extends UnauthorizedException {
    constructor() {
        super(ErrorMessage.TOKEN_EXPIRED);
    }
}