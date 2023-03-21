import { Injectable } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { MsgToken } from "apps/msg/src/auth/jwt/msg-token";
import { UserService } from "../user/user.service";
import { UserSignupDto } from "../user/dto/user-signup.dto";
import { UserSigninDto } from "../user/dto/user-signin.dto";
import { JwtPayload } from "./jwt/jwt-payload";
import { compare } from "bcrypt";
import { UserIncorrectEmailException } from "../exceptions/user/user-incorrect-email.exception";
import { UserIncorrectPasswordException } from "../exceptions/user/user-incorrect-password.exception";
import { UnauthorizedAccessException } from "../exceptions/auth/unauthorized-access.exception";
import { TokenExpiredException } from "../exceptions/auth/token-expired.exception";
import { UserDto } from "../user/dto/user.dto";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) { }

    async signup(dto: UserSignupDto): Promise<UserDto> {
        return await this.userService.save(dto);
    }

    async signin(dto: UserSigninDto): Promise<MsgToken> {
        const user = await this.userService.findUserEntityByEmail(dto.email);

        if (!user) {
            throw new UserIncorrectEmailException();
        }

        if (!(await compare(dto.password, user.password))) {
            throw new UserIncorrectPasswordException();
        }

        const msgToken = await this.generateToken(user.id, user.email);
        await this.updateRefreshToken(user.id, msgToken.refreshToken);
        return msgToken;
    }

    async logout(id: number): Promise<boolean> {
        await this.userService.update(id, { refreshToken: null });
        return true
    }

    async refreshToken(id: number, email: string, refreshToken: string): Promise<MsgToken> {
        const user = await this.userService.findUserEntityById(id);

        if (!user) {
            throw new UnauthorizedAccessException();
        }

        if (!(refreshToken === user.refreshToken)) {
            throw new TokenExpiredException();
        }

        const msgToken = await this.generateToken(id, email);
        await this.updateRefreshToken(id, msgToken.refreshToken);
        return msgToken;
    }

    private async generateToken(id: number, email: string): Promise<MsgToken> {
        const payload: JwtPayload = { sub: id, email: email }
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.sign(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME }),
            this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME })
        ]);

        return { accessToken, refreshToken };
    }

    private async updateRefreshToken(id: number, refreshToken: string) {
        return await this.userService.update(id, { refreshToken });
    }
}