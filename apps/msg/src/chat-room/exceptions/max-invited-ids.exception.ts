import { BadRequestException } from '@nestjs/common';
import { ErrorMessage } from '../../common/exception/error-message';

export class MaxInvitedIdsException extends BadRequestException {
  constructor() {
    super(ErrorMessage.HOST_ID_IN_INVITED_USER_IDS);
  }
}
