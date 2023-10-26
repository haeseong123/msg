import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserRelationFromIdUserIdMismatchException } from '../exceptions/user-relation-from-id-user-id-mismatch.exception';
import { UserRelationIdParamMismatchException } from '../exceptions/user-relation-id-param-mismatch.exception';
import { plainToInstance } from 'class-transformer';
import { UserRelationDto } from '../dto/user-relation.dto';
import { Request } from 'express';
import { MsgUser } from '@app/msg-core/jwt/msg-user';

@Injectable()
export class UserRelationUpdateGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = plainToInstance(MsgUser, request.user);
    const dto = plainToInstance(UserRelationDto, request.body);
    const relationIdFromParam = parseInt(request.params.id, 10);

    /**
     * token.id 와 dto.fromUserId는 같아야 합니다.
     */
    const isValidUserId = user.sub === dto.fromUserId;

    /**
     * dto.id와 param의 relationId는 같아야 합니다.
     */
    const isValidRelationId = dto.id === relationIdFromParam;

    if (!isValidUserId) {
      throw new UserRelationFromIdUserIdMismatchException();
    }

    if (!isValidRelationId) {
      throw new UserRelationIdParamMismatchException();
    }

    return true;
  }
}
