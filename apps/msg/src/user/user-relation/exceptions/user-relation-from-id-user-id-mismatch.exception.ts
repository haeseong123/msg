import { BadRequestException } from "@nestjs/common";
import { ErrorMessage } from "apps/msg/src/common/exception/error-message";

export class UserRelationFromIdUserIdMismatchException extends BadRequestException {
    constructor() {
        super(ErrorMessage.USER_RELATION_FROM_ID_USER_ID_MISMATCH);
    }
}