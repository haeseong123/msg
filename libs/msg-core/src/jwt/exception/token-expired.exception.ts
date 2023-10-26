import { ErrorMessage } from '@app/msg-core/common/exception/error-message';
import { UnauthorizedException } from '@nestjs/common';

export class TokenExpiredException extends UnauthorizedException {
  constructor() {
    super(ErrorMessage.TOKEN_EXPIRED);
  }
}
