import { ErrorMessage } from "@app/msg-core/error.message";
import { ConflictException } from "@nestjs/common";

export class UserEmailConflictException extends ConflictException {
    constructor() {
        super(ErrorMessage.USER_EMAIL_ALREADY_EXIST);
    }
}