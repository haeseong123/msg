import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AccessTokenStrategy } from "./jwt/strategy/access.token.strategy";
import { RefreshTokenStrategy } from "./jwt/strategy/refresh.token.strategy";

@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({})
    ],
    controllers: [AuthController],
    providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy]
})
export class AuthModule { }