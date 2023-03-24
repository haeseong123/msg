import { BadRequestException } from "@nestjs/common";
import { ErrorMessage } from "../../exceptions/error-message";

export class UserDuplicateInvitationException extends BadRequestException {
    constructor() {
        super(ErrorMessage.USER_DUPLICATE_INVITATION_EXCEPTION);
    }
}