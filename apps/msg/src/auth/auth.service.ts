import { Injectable } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { UserEmailConflictException } from "@app/msg-core/user/exception/user.email.conflict.exception";
import { UserIncorrectEmailException } from "@app/msg-core/user/exception/user.incorrect.email.exception";
import { UserIncorrectPasswordException } from "@app/msg-core/user/exception/user.incorrect.password.exception";
import { MsgToken } from "apps/msg/src/auth/msg.token";
import { JwtPayload } from "./jwt.payload";
import { UnauthorizedAccessException } from "@app/msg-core/auth/exception/unauthorized.access.exception";
import { TokenExpiredException } from "@app/msg-core/auth/exception/token.expired.exception";
import { UsersService } from "../user/user.service";
import { UserSignupDto } from "../user/dto/user.signup.dto";
import { UserSigninDto } from "../user/dto/user.signin.dto";
import { hashString, verifyString } from "../util/hash.utils";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService
    ) { }

    async signup(dto: UserSignupDto) {
        if (await this.userService.findUserByEmail(dto.email)) {
            throw new UserEmailConflictException();
        }

        await this.userService.saveUser(dto);
    }

    async signin(dto: UserSigninDto): Promise<MsgToken> {
        const user = await this.userService.findUserByEmail(dto.email);

        if (!user) {
            throw new UserIncorrectEmailException();
        }

        const isMatch = await verifyString(dto.password, user.password);

        if (!isMatch) {
            throw new UserIncorrectPasswordException();
        }

        const msgToken = await this.generateToken(user.id, user.email);
        await this.updateRefreshToken(user.id, msgToken.refreshToken);
        return msgToken;
    }

    async logout(id: number) {
        await this.userService.updateUser(id, { refreshToken: null });
    }

    async refreshToken(id: number, email: string, refreshToken: string): Promise<MsgToken> {
        const user = await this.userService.findUserById(id);

        if (!user) {
            throw new UnauthorizedAccessException();
        }

        const isMatch = refreshToken === user.refreshToken;

        if (!isMatch) {
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
        const hashedRefreshToken = await hashString(refreshToken);
        return await this.userService.updateUser(id, { refreshToken });
    }
}