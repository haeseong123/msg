import { MsgToken } from "apps/msg/src/auth/jwt/msg-token";
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtGuard } from "./jwt/guard/jwt.guard";
import { JwtRefreshGuard } from "./jwt/guard/jwt-refresh.guard";
import { UserSignupDto } from "../user/dto/user-signup.dto";
import { UserSigninDto } from "../user/dto/user-signin.dto";
import { User } from "@app/msg-core/entities/user/user.entity";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signup(@Body() signupDto: UserSignupDto): Promise<User> {
        return this.authService.signup(signupDto);
    }

    @Post('signin')
    @HttpCode(HttpStatus.OK)
    async signin(@Body() signinDto: UserSigninDto): Promise<MsgToken> {
        return this.authService.signin(signinDto)
    }

    @Post('logout')
    @UseGuards(JwtGuard)
    @HttpCode(HttpStatus.OK)
    async logout(@Req() { user }): Promise<boolean> {
        return this.authService.logout(user.sub)
    }

    @Post('refresh-token')
    @UseGuards(JwtRefreshGuard)
    async refreshToken(@Req() { user }): Promise<MsgToken> {
        const { sub: id, email, refreshToken } = user;
        return this.authService.refreshToken(id, email, refreshToken)
    }
}