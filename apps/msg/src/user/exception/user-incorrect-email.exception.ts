import { UnauthorizedException } from '@nestjs/common';
import { ErrorMessage } from '../../common/exception/error-message';

export class UserIncorrectEmailException extends UnauthorizedException {
  constructor() {
    super(ErrorMessage.LOGIN_INPUT_INVALID_EMAIL);
  }
}
