import { Injectable } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { MsgToken } from "apps/msg/src/auth/jwt/msg-token";
import { UserService } from "../user/user.service";
import { UserSignupDto } from "../user/dto/user-signup.dto";
import { UserSigninDto } from "../user/dto/user-signin.dto";
import { JwtPayload } from "./jwt/jwt-payload";
import { compare } from "bcrypt";
import { TokenExpiredException } from "./exceptions/token-expired.exception";
import { UserIncorrectEmailException } from "./exceptions/user-incorrect-email.exception";
import { UserIncorrectPasswordException } from "./exceptions/user-incorrect-password.exception";
import { UnauthorizedAccessException } from "./exceptions/unauthorized-access.exception";
import { UserEmailConflictException } from "./exceptions/user-email-conflict.exception";
import { User } from "@app/msg-core/entities/user/user.entity";
import { UpdateResult } from "typeorm";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) { }

    async signup(dto: UserSignupDto): Promise<User> {
        const user = await this.userService.findUserByEmail(dto.email);

        if (user) {
            throw new UserEmailConflictException();
        }

        return await this.userService.save(await dto.toEntity());
    }

    async signin(dto: UserSigninDto): Promise<MsgToken> {
        const user = await this.userService.findUserByEmail(dto.email);

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

    async logout(id: number): Promise<UpdateResult> {
        const user = await this.userService.findUserById(id);

        if (!user) {
            throw new UnauthorizedAccessException();
        }

        return await this.userService.update(id, { refreshToken: null });
    }

    async refreshToken(id: number, email: string, refreshToken: string): Promise<MsgToken> {
        const user = await this.userService.findUserById(id);

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
        const payload: JwtPayload = { sub: id, email: email };
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