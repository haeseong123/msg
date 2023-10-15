import { ErrorMessage } from "@app/msg-core/common/exception/error-message";
import { BadRequestException } from "@nestjs/common";

export class DuplicateRelationException extends BadRequestException {
    constructor() {
        super(ErrorMessage.DUPLICATE_RELATION);
    }
}