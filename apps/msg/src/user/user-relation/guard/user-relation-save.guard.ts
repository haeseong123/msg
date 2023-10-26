import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserRelationFromIdUserIdMismatchException } from '../exceptions/user-relation-from-id-user-id-mismatch.exception';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import { MsgUser } from '@app/msg-core/jwt/msg-user';
import { ArgumentInvalidException } from 'apps/msg/src/common/exception/argument-invalid.exception';
import { UserRelationSaveDto } from '../dto/user-relation-save.dto';

@Injectable()
export class UserRelationSaveGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = plainToInstance(MsgUser, request.user);
    const dto = plainToInstance(UserRelationSaveDto, request.body);

    /**
     * token의 id와 dto.fromUserId는 같아야 합니다.
     */
    const isValidUserId = user.sub === dto.fromUserId;

    /**
     * dto.fromUserId와 dto.toUserId는 달라야 합니다.
     */
    const isValidFromUserIdAndToUserId = dto.fromUserId !== dto.toUserId;

    /**
     * userId가 유효하지 않으면 예외를 던집니다.
     */
    if (!isValidUserId) {
      throw new UserRelationFromIdUserIdMismatchException();
    }

    /**
     * dto에 담긴 fromUserId와 toUserId가 유효하지 않으면 예외를 던집니다.
     */
    if (!isValidFromUserIdAndToUserId) {
      throw new ArgumentInvalidException();
    }

    return true;
  }
}
