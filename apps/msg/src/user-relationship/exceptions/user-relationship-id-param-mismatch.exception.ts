import { BadRequestException } from "@nestjs/common";
import { ErrorMessage } from "../../common/exception/error-message";

export class UserRelationshipIdParamMismatchException extends BadRequestException {
    constructor() {
        super(ErrorMessage.USER_RELATIONSHIP_ID_PARAM_MISMATCH);
    }
}