import { ErrorMessage } from '@app/msg-core/common/exception/error-message';
import { BadRequestException } from '@nestjs/common';

export class UnauthorizedInvitationException extends BadRequestException {
  constructor() {
    super(ErrorMessage.UNFOLLOWED_USERS_IN);
  }
}
