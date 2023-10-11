import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AccessTokenStrategy } from "./jwt/strategy/access-token.strategy";
import { RefreshTokenStrategy } from "./jwt/strategy/refresh-token.strategy";
import { TokenService } from "./jwt/token.service";

@Module({
    imports: [
        UserModule,
        PassportModule,
        /**
         * 이건 왜 있어야 하지?
         */
        // JwtModule.register({})
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        AccessTokenStrategy,
        RefreshTokenStrategy,
        TokenService,
    ],
})
export class AuthModule { }