import { BadRequestException } from "@nestjs/common";
import { ErrorMessage } from "../../common/exception/error-message";

export class UnauthorizedInvitationException extends BadRequestException {
    constructor() {
        super(ErrorMessage.UNAUTHORIZED_INVITATION);
    }
}