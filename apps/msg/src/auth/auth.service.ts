import { Injectable } from "@nestjs/common";
import { UserSigninDto } from "../user/dto/user-signin.dto";
import { JwtPayload } from "./jwt/jwt-payload";
import { compare } from "bcrypt";
import { TokenExpiredException } from "./exceptions/token-expired.exception";
import { UserIncorrectEmailException } from "./exceptions/user-incorrect-email.exception";
import { UserIncorrectPasswordException } from "./exceptions/user-incorrect-password.exception";
import { UnauthorizedAccessException } from "./exceptions/unauthorized-access.exception";
import { User } from "@app/msg-core/entities/user/user.entity";
import { UserEmailAlreadyExistsException } from "./exceptions/user-email-already-exists.exception";
import { TokenService } from "./jwt/token.service";
import { UsingRefreshTokenDto } from "./dto/using-refresh-token.dto";
import { MsgTokenDto } from "./jwt/dto/msg-token.dto";
import { UserSingUpDto } from "../user/dto/user-signup.dto";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
    ) { }

    /**
     * 회원가입
     */
    async signup(dto: UserSingUpDto): Promise<User> {
        /**
         * client가 보낸 dto에 있는 email로 user를 가져옵니다. 
         */
        const duplicateEmailUser = await this.userService.findByEmail(dto.emailInfoDto.emailLocal, dto.emailInfoDto.emailDomain);

        /**
         * 이메일 중복을 확인합니다.
         */
        if (duplicateEmailUser) {
            throw new UserEmailAlreadyExistsException();
        }

        /**
         * user를 DB에 저장합니다. (회원가입)
         */
        const user = await dto.toEntity();
        const savedUser = await this.userService.save(user);

        return savedUser;
    }

    /**
     * 로그인
     */
    async signin(dto: UserSigninDto): Promise<MsgTokenDto> {
        /**
         * client가 보낸 dto에 있는 email로 user를 가져옵니다. 
         */
        const user = await this.userService.findByEmail(dto.emailInfoDto.emailLocal, dto.emailInfoDto.emailDomain);

        /**
         * user가 존재하는지 확인합니다.
         */
        if (!user) {
            throw new UserIncorrectEmailException();
        }

        /**
         * user.password와 dto.password가 일치하는지 확인합니다.
         */
        const isValidPassword = await compare(dto.password, user.password);
        if (!isValidPassword) {
            throw new UserIncorrectPasswordException();
        }

        return await this.generateToken(user);
    }

    /**
     * 로그아웃
     */
    async logout(id: number): Promise<boolean> {
        /**
         * id로 user를 가져옵니다.
         */
        const user = await this.userService.findById(id);

        /**
         * user가 있는지 확인합니다.
         */
        if (!user) {
            throw new UnauthorizedAccessException();
        }

        /**
         * refreshToken을 폐기합니다.
         */
        user.removeRefreshToken();
        await this.userService.save(user);

        return true;
    }

    /**
     * refreshToken을 사용하여 새 토큰 발행
     */
    async refreshToken(dto: UsingRefreshTokenDto): Promise<MsgTokenDto> {
        /**
         * id로 user를 가져옵니다.
         */
        const user = await this.userService.findById(dto.id);

        /**
         * user가 존재하는지 확인합니다.
         */
        if (!user) {
            throw new UnauthorizedAccessException();
        }

        /**
         * user.refreshToken과 dto.refreshToken이 일치하는지 확인합니다.
         */
        const isValidRefreshToken = dto.refreshToken === user.refreshToken
        if (!isValidRefreshToken) {
            throw new TokenExpiredException();
        }

        return await this.generateToken(user);
    }

    /**
     * 새 토큰 발행
     */
    private async generateToken(user: User): Promise<MsgTokenDto> {
        /**
         * 토큰을 생성합니다.
         */
        const payload: JwtPayload = {
            sub: user.id,
            email: user.emailInfo.email
        };
        const msgToken = this.tokenService.generateToken(payload);

        /**
         * refreshToken을 등록합니다.
         */
        user.createRefreshToken(msgToken.refreshToken);
        await this.userService.save(user);

        /**
         * 토큰을 반환합니다.
         */
        return msgToken;
    }
}