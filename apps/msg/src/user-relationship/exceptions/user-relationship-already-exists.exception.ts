import { ConflictException } from "@nestjs/common";
import { ErrorMessage } from "../../common/exception/error-message";

export class UserRelationshipAlreadyExistsException extends ConflictException {
    constructor() {
        super(ErrorMessage.USER_RELATIONSHIP_ALREADY_EXISTS);
    }
}