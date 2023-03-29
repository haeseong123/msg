import { NotFoundException } from "@nestjs/common";
import { ErrorMessage } from "../../common/exception/error-message";

export class UserNotFoundedException extends NotFoundException {
    constructor() {
        super(ErrorMessage.USER_NOT_FOUNDED);
    }
}