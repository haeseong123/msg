import { ErrorMessage } from "@app/msg-core/common/exception/error-message";
import { BadRequestException } from "@nestjs/common";

export class NotFoundRelationException extends BadRequestException {
    constructor() {
        super(ErrorMessage.NOT_FOUND_RELATION);
    }
}