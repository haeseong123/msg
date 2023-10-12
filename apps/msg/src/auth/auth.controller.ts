import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserSigninDto } from "../user/dto/user-signin.dto";
import { CurrentUser } from "./decorator/current-user.decorator";
import { UserDto } from "../user/dto/user.dto";
import { UsingRefreshTokenDto } from "./dto/using-refresh-token.dto";
import { UserSingUpDto } from "../user/dto/user-signup.dto";
import { UsingRefreshToken } from "./decorator/using-refresh-token.decorator";
import { MsgTokenDto } from "@app/msg-core/jwt/dto/msg-token.dto";
import { JwtGuard } from "@app/msg-core/jwt/guard/jwt.guard";
import { JwtRefreshGuard } from "@app/msg-core/jwt/guard/jwt-refresh.guard";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    async signup(
        @Body() dto: UserSingUpDto
    ): Promise<UserDto> {
        const user = await this.authService.signup(dto);

        return UserDto.of(user);
    }

    @Post('signin')
    @HttpCode(HttpStatus.OK)
    async signin(
        @Body() signinDto: UserSigninDto
    ): Promise<MsgTokenDto> {
        return await this.authService.signin(signinDto);
    }

    @Post('logout')
    @UseGuards(JwtGuard)
    @HttpCode(HttpStatus.OK)
    async logout(
        @CurrentUser('sub') sub: number
    ): Promise<boolean> {
        return await this.authService.logout(sub);
    }

    @Post('refresh-token')
    @UseGuards(JwtRefreshGuard)
    async refreshToken(
        @UsingRefreshToken() dto: UsingRefreshTokenDto,
    ): Promise<MsgTokenDto> {
        const msgTokenDto = await this.authService.refreshToken(dto);

        return msgTokenDto;
    }
}