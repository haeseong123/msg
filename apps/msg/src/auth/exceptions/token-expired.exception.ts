import { UnauthorizedException } from "@nestjs/common";
import { ErrorMessage } from "../../exceptions/error-message";

export class TokenExpiredException extends UnauthorizedException {
    constructor() {
        super(ErrorMessage.TOKEN_EXPIRED);
    }
}