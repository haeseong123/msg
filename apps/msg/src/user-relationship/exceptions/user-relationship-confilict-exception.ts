import { ConflictException } from "@nestjs/common";
import { ErrorMessage } from "../../exceptions/error-message";

export class UserRelationshipConflictException extends ConflictException {
    constructor() {
        super(ErrorMessage.USER_RELATIONSHIP_CONFLICT);
    }
}