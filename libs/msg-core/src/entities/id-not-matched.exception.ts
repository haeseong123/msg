import { ErrorMessage } from '@app/msg-core/common/exception/error-message';
import { BadRequestException } from '@nestjs/common';

export class IdNotMatchedException extends BadRequestException {
  constructor() {
    super(ErrorMessage.ID_NOT_MACTHED);
  }
}
