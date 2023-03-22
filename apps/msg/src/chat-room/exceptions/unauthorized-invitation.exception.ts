import { BadRequestException } from "@nestjs/common";
import { ErrorMessage } from "../../exceptions/error-message";

export class UnauthorizedInvitationException extends BadRequestException {
    constructor() {
        super(ErrorMessage.UNAUTHORIZED_INVITATION);
    }
}