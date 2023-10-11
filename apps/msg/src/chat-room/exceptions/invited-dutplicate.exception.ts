import { BadRequestException } from "@nestjs/common";
import { ErrorMessage } from "../../common/exception/error-message";

export class InvitedDutplicateException extends BadRequestException {
    constructor() {
        super(ErrorMessage.INVITED_DUPLICATE);
    }
}