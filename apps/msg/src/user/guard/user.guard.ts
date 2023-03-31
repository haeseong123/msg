import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { UnauthorizedAccessException } from "../../auth/exceptions/unauthorized-access.exception";

@Injectable()
export class UserGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const sub = request.user?.sub; // 토큰의 sub 값
        const userId = parseInt(request.params.userId, 10); // path parameter의 userId 값

        if (!sub || sub !== userId) {
            throw new UnauthorizedAccessException();
        }

        return true;
    }
}