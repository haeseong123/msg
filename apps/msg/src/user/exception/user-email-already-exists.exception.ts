import { ConflictException } from '@nestjs/common';
import { ErrorMessage } from '../../common/exception/error-message';

export class UserEmailAlreadyExistsException extends ConflictException {
  constructor() {
    super(ErrorMessage.USER_EMAIL_ALREADY_EXISTS);
  }
}
