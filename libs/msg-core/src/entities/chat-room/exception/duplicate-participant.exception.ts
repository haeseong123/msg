import { ErrorMessage } from '@app/msg-core/common/exception/error-message';
import { BadRequestException } from '@nestjs/common';

export class DuplicateParticipantException extends BadRequestException {
  constructor() {
    super(ErrorMessage.DUPLICATE_PARTICIPANT);
  }
}
