import { BadRequestException } from "@nestjs/common/exceptions";
import { ErrorMessage } from "./error-message";

export class ArgumentInvalidException extends BadRequestException {
    constructor() {
        super(ErrorMessage.ARGUMENT_INVALID);
    }
}