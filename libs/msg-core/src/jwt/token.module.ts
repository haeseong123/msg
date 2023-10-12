import { Module } from "@nestjs/common";
import { TokenService } from "./token.service";
import { AccessTokenStrategy } from "./strategy/access-token.strategy";
import { RefreshTokenStrategy } from "./strategy/refresh-token.strategy";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [
        PassportModule,
        /** jwtService 주입받아야 됨 */
        JwtModule.register({})
    ],
    providers: [
        AccessTokenStrategy,
        RefreshTokenStrategy,
        TokenService,
    ],
    exports: [
        AccessTokenStrategy,
        RefreshTokenStrategy,
        TokenService,
    ],
})
export class TokenModule { }
