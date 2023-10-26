import { UnauthorizedException } from '@nestjs/common';
import { ErrorMessage } from '../../common/exception/error-message';

export class UserIncorrectPasswordException extends UnauthorizedException {
  constructor() {
    super(ErrorMessage.LOGIN_INPUT_INVALID_PASSWORD);
  }
}
