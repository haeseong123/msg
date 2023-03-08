import { MsgToken } from "apps/msg/src/auth/msg.token";
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtGuard } from "./guard/jwt.auth.guard";
import { JwtRefreshGuard } from "./guard/jwt.refresh.guard";
import { UserSignupDto } from "../user/dto/user.signup.dto";
import { UserSigninDto } from "../user/dto/user.signin.dto";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signup(@Body() signupDto: UserSignupDto): Promise<void> {
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
    async logout(@Req() { payload: { sub } }) {
        return this.authService.logout(sub)
    }

    @Post('refresh-token')
    @UseGuards(JwtRefreshGuard)
    async refreshToken(@Req() { user }): Promise<MsgToken> {
        const { sub: id, email, refreshToken } = user;
        return this.authService.refreshToken(id, email, refreshToken)
    }
}