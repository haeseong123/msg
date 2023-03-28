import { BadRequestException } from "@nestjs/common";
import { ErrorMessage } from "../../common/exception/error-message";

export class UserDuplicateInvitationException extends BadRequestException {
    constructor() {
        super(ErrorMessage.USER_DUPLICATE_INVITATION_EXCEPTION);
    }
}