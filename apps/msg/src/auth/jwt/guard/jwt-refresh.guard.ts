import { TokenExpiredException } from "@app/msg-core/exceptions/auth/token-expired.exception";
import { UnauthorizedAccessException } from "@app/msg-core/exceptions/auth/unauthorized-access.exception";
import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
    handleRequest(err, user, info, context) {
        if (err || !user) {
            if (info && info.name === "TokenExpiredError") {
                throw new TokenExpiredException()
            } else {
                throw new UnauthorizedAccessException()
            }
        }

        return user
    }
}