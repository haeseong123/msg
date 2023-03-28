import { BadRequestException } from "@nestjs/common";
import { ErrorMessage } from "../../common/exception/error-message";

export class UserRelationshipIdTokenIdMismatchException extends BadRequestException {
    constructor() {
        super(ErrorMessage.USER_RELATIONSHIP_ID_TOKEN_ID_MISMATCH);
    }
}