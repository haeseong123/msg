import { BadRequestException } from "@nestjs/common";
import { ErrorMessage } from "apps/msg/src/common/exception/error-message";

export class UserRelationIdParamMismatchException extends BadRequestException {
    constructor() {
        super(ErrorMessage.USER_RELATION_ID_PARAM_MISMATCH);
    }
}