import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { TokenExpiredException } from "../exception/token-expired.exception";
import { UnauthorizedAccessException } from "../exception/unauthorizated-access.exception";

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