import { Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TokenModule } from "@app/msg-core/jwt/token.module";

@Module({
    imports: [
        UserModule,
        TokenModule,
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule { }
