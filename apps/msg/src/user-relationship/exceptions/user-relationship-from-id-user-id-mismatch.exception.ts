import { BadRequestException } from "@nestjs/common";
import { ErrorMessage } from "../../common/exception/error-message";

export class UserRelationshipFromIdUserIdMismatchException extends BadRequestException {
    constructor() {
        super(ErrorMessage.USER_RELATIONSHIP_FROM_ID_USER_ID_MISMATCH);
    }
}