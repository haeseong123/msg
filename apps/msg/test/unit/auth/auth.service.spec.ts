import { User } from "@app/msg-core/entities/user/user.entity";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import { UserSigninDto } from "../../../src/user/dto/user-signin.dto";
import { UserSignupDto } from "../../../src/user/dto/user-signup.dto";
import { UserService } from "../../../src/user/user.service";
import { AuthService } from "../../../src/auth/auth.service"
import { JwtPayload } from "../../../src/auth/jwt/jwt-payload";
import { TokenExpiredException } from "../../../src/auth/exceptions/token-expired.exception";
import { UserIncorrectEmailException } from "../../../src/auth/exceptions/user-incorrect-email.exception";
import { UserIncorrectPasswordException } from "../../../src/auth/exceptions/user-incorrect-password.exception";
import { UnauthorizedAccessException } from "../../../src/auth/exceptions/unauthorized-access.exception";
import { MsgToken } from "../../../src/auth/jwt/dto/msg-token.dto";
import { UpdateResult } from "typeorm";
import { UserEmailAlreadyExistsException } from "../../../src/auth/exceptions/user-email-already-exists.exception";

describe('AuthService', () => {
    let authService: AuthService;
    let userService: UserService;
    let jwtService: JwtService;

    beforeEach(async () => {
        const userServiceMock = {
            save: jest.fn(),
            findUserByEmail: jest.fn(),
            update: jest.fn(),
            findUserById: jest.fn()
        };
        const jwtServiceMock = {
            sign: jest.fn()
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserService,
                    useValue: userServiceMock
                },
                {
                    provide: JwtService,
                    useValue: jwtServiceMock
                }
            ]
        }).compile();

        authService = module.get<AuthService>(AuthService);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('회원_가입', () => {
        let dto: UserSignupDto;
        let entity: User;

        beforeEach(() => {
            dto = new UserSignupDto();
            dto.email = "test@asd.com";
            dto.password = "123qwe";
            dto.address = "address";
            dto.nickname = "nickname";
            entity = new User(
                dto.email,
                dto.password,
                dto.address,
                dto.nickname
            )
        })
        it('성공', async () => {
            const signupSpy = jest.spyOn(authService, 'signup');
            const findSpy = jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
            const toUserSpy = jest.spyOn(dto, 'toEntity').mockResolvedValue(entity);
            const saveSpy = jest.spyOn(userService, 'save').mockResolvedValue(entity);

            // When
            const result = await authService.signup(dto);

            // Then
            expect(signupSpy).toHaveBeenCalledWith(dto);
            expect(findSpy).toHaveBeenCalledWith(dto.email);
            expect(toUserSpy).toHaveBeenCalled();
            expect(saveSpy).toHaveBeenCalledWith(entity);
            expect(result).toBe(entity);
        });

        it('실패_이메일이_겹침', async () => {
            // Given
            const signupSpy = jest.spyOn(authService, 'signup');
            const findSpy = jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(entity);

            // When
            const resultPromise = authService.signup(dto);

            // Then
            await expect(resultPromise).rejects.toThrow(UserEmailAlreadyExistsException);
            expect(signupSpy).toHaveBeenCalledWith(dto);
            expect(findSpy).toHaveBeenCalledWith(dto.email);
        });
    })

    describe('로그인', () => {
        let dto: UserSigninDto;
        let user: User;

        beforeEach(() => {
            dto = new UserSigninDto();
            dto.email = 'a@a.com';
            dto.password = 'password';
            user = new User(
                dto.email,
                dto.password,
                'add',
                'nick'
            )
        });

        it('성공', async () => {
            // Given
            const accessToken = 'access_token';
            const refreshToken = 'refresh_token';
            const msgToken: MsgToken = {
                accessToken,
                refreshToken
            }
            const payload: JwtPayload = { sub: user.id, email: user.email };

            const signinSpy = jest.spyOn(authService, 'signin');
            const findUserByEmailSpy = jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user);
            const compareSpy = jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);
            const jwtSignSpy = jest.spyOn(jwtService, 'sign')
                .mockImplementationOnce(() => accessToken)
                .mockImplementationOnce(() => refreshToken);
            const updateSpy = jest.spyOn(userService, 'update');

            // When
            const result = await authService.signin(dto);

            // Then
            expect(signinSpy).toHaveBeenCalledWith(dto);
            expect(findUserByEmailSpy).toHaveBeenCalledWith(dto.email);
            expect(compareSpy).toHaveBeenCalledWith(dto.password, user.password);
            expect(jwtSignSpy).toHaveBeenCalledTimes(2);
            expect(jwtSignSpy).toHaveBeenCalledWith(
                payload,
                { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME }
            );
            expect(jwtSignSpy).toHaveBeenCalledWith(
                payload,
                { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME }
            );
            expect(updateSpy).toHaveBeenCalledWith(user.id, { refreshToken });
            expect(result).toStrictEqual(msgToken);
        });

        it('실패_이메일_불일치', async () => {
            // Given
            const signinSpy = jest.spyOn(authService, 'signin');
            const findUserByEmailSpy = jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(undefined);

            // When
            const resultPromise = authService.signin(dto);

            // Then
            await expect(resultPromise).rejects.toThrow(UserIncorrectEmailException);
            expect(signinSpy).toHaveBeenCalledWith(dto);
            expect(findUserByEmailSpy).toHaveBeenCalledWith(dto.email);
        });

        it('실패_비밀번호_불일치', async () => {
            // Given
            const signinSpy = jest.spyOn(authService, 'signin');
            const findUserByEmailSpy = jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user);
            const compareSpy = jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);

            // When
            const resultPromise = authService.signin(dto);

            // Then
            await expect(resultPromise).rejects.toThrow(UserIncorrectPasswordException);
            expect(signinSpy).toHaveBeenCalledWith(dto);
            expect(findUserByEmailSpy).toHaveBeenCalledWith(dto.email);
            expect(compareSpy).toHaveBeenCalledWith(dto.password, user.password);
        });
    })

    describe('로그_아웃', () => {
        let userId: number;
        let user: User;

        beforeEach(() => {
            userId = 10;
            user = new User(
                'ema@a.com',
                'pass',
                'add',
                'nick'
            );
        });

        it('성공', async () => {
            // Given
            const logoutSpy = jest.spyOn(authService, 'logout');
            const findByIdSpy = jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
            const updateSpy = jest.spyOn(userService, 'update').mockResolvedValue();

            // When
            const result = await authService.logout(userId);

            // Then
            expect(logoutSpy).toHaveBeenCalledWith(userId);
            expect(findByIdSpy).toHaveBeenCalledWith(userId);
            expect(updateSpy).toHaveBeenCalledWith(userId, { refreshToken: null });
            expect(result).toBeUndefined();
        })

        it('실패_userId와_일치하는_유저_없음', async () => {
            // Given
            const logoutSpy = jest.spyOn(authService, 'logout');
            const findByIdSpy = jest.spyOn(userService, 'findUserById').mockResolvedValue(null);

            // When
            const resultPromise = authService.logout(userId);

            // Then
            await expect(resultPromise).rejects.toThrow(UnauthorizedAccessException);
            expect(logoutSpy).toHaveBeenCalledWith(userId);
            expect(findByIdSpy).toHaveBeenCalledWith(userId);
        })
    })

    describe('토큰_재발급', () => {
        let user: User;

        beforeEach(() => {
            user = new User(
                'a@a.com',
                'password',
                'add',
                'nick'
            );
            user.refreshToken = 'some_refresh_token';
        });

        it('성공', async () => {
            // Given
            const accessToken = 'access_token';
            const refreshToken = 'refresh_token';
            const msgToken: MsgToken = {
                accessToken,
                refreshToken
            };
            const payload: JwtPayload = { sub: user.id, email: user.email };

            const refreshTokenSpy = jest.spyOn(authService, 'refreshToken');
            const findUserByIdSpy = jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
            const jwtSignSpy = jest.spyOn(jwtService, 'sign')
                .mockImplementationOnce(() => accessToken)
                .mockImplementationOnce(() => refreshToken);
            const updateSpy = jest.spyOn(userService, 'update');

            // When
            const result = await authService.refreshToken(user.id, user.email, user.refreshToken);

            // Then
            expect(refreshTokenSpy).toBeCalledWith(user.id, user.email, user.refreshToken);
            expect(findUserByIdSpy).toBeCalledWith(user.id);
            expect(jwtSignSpy).toHaveBeenCalledTimes(2);
            expect(jwtSignSpy).toHaveBeenCalledWith(
                payload,
                { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME }
            );
            expect(jwtSignSpy).toHaveBeenCalledWith(
                payload,
                { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME }
            );
            expect(updateSpy).toBeCalledWith(user.id, { refreshToken });
            expect(result).toStrictEqual(msgToken);
        });

        it('실패_id와_일치하는_user가_없음', async () => {
            // Given
            const refreshTokenSpy = jest.spyOn(authService, 'refreshToken');
            const findUserByIdSpy = jest.spyOn(userService, 'findUserById').mockResolvedValue(null);

            // When
            const resultPromise = authService.refreshToken(user.id, user.email, user.refreshToken);

            // Then
            await expect(resultPromise).rejects.toThrow(UnauthorizedAccessException);
            expect(refreshTokenSpy).toBeCalledWith(user.id, user.email, user.refreshToken);
            expect(findUserByIdSpy).toBeCalledWith(user.id);
        });

        it('실패_refreshToken_값이_서로_다름', async () => {
            // Given
            const otherRefreshToken = 'other_refresh_token';
            const refreshTokenSpy = jest.spyOn(authService, 'refreshToken');
            const findUserByIdSpy = jest.spyOn(userService, 'findUserById').mockResolvedValue(user);

            // When
            const resultPromise = authService.refreshToken(user.id, user.email, otherRefreshToken);

            // Then
            await expect(resultPromise).rejects.toThrow(TokenExpiredException);
            expect(refreshTokenSpy).toBeCalledWith(user.id, user.email, otherRefreshToken);
            expect(findUserByIdSpy).toBeCalledWith(user.id);
        });
    });
});