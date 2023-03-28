import { User } from "@app/msg-core/entities/user/user.entity";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import { UserSigninDto } from "../../user/dto/user-signin.dto";
import { UserSignupDto } from "../../user/dto/user-signup.dto";
import { UserService } from "../../user/user.service";
import { AuthService } from "../auth.service"
import { JwtPayload } from "../jwt/jwt-payload";
import { TokenExpiredException } from "../exceptions/token-expired.exception";
import { UserIncorrectEmailException } from "../exceptions/user-incorrect-email.exception";
import { UserIncorrectPasswordException } from "../exceptions/user-incorrect-password.exception";
import { UnauthorizedAccessException } from "../exceptions/unauthorized-access.exception";
import { UserEmailConflictException } from "../exceptions/user-email-already-exists.exception";
import { MsgToken } from "../jwt/msg-token";
import { UpdateResult } from "typeorm";

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
        it('성공', async () => {
            // Given
            const dto: UserSignupDto = {
                email: "test@asd.com",
                password: "123qwe",
                address: "address",
                nickname: "nickname",
            };
            const entity: User = User.of(
                dto.email,
                dto.password,
                dto.address,
                dto.nickname
            );
            const signupSpy = jest.spyOn(authService, 'signup');
            const findSpy = jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
            const toUserSpy = jest.spyOn(UserSignupDto, 'toUser').mockResolvedValue(entity);
            const saveSpy = jest.spyOn(userService, 'save').mockResolvedValue(entity);

            // When
            const result = await authService.signup(dto);

            // Then
            expect(signupSpy).toHaveBeenCalledWith(dto);
            expect(findSpy).toHaveBeenCalledWith(dto.email);
            expect(toUserSpy).toHaveBeenCalledWith(dto);
            expect(saveSpy).toHaveBeenCalledWith(entity);
            expect(result).toBe(entity);
        });

        it('실패_이메일이_겹침', async () => {
            // Given
            const dto: UserSignupDto = {
                email: "test@asd.com",
                password: "123qwe",
                address: "address",
                nickname: "nickname",
            };
            const user: User = User.of(
                dto.email,
                dto.password,
                dto.address,
                dto.nickname
            );
            const signupSpy = jest.spyOn(authService, 'signup');
            const findSpy = jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user);

            // When
            const resultPromise = authService.signup(dto);

            // Then
            await expect(resultPromise).rejects.toThrow(UserEmailConflictException);
            expect(signupSpy).toHaveBeenCalledWith(dto);
            expect(findSpy).toHaveBeenCalledWith(dto.email);
        });
    })

    describe('로그인', () => {
        const user: User = User.of(
            'a@a.com',
            'password',
            'add',
            'nick'
        );
        const dto: UserSigninDto = {
            email: user.email,
            password: user.password
        };

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
        it('성공', async () => {
            // Given
            const userId = 10;
            const user: User = User.of('ema@a.com', 'pass', 'add', 'nick');
            const updateResult: UpdateResult = {
                raw: 'asd',
                affected: 1,
                generatedMaps: [],
            }
            const logoutSpy = jest.spyOn(authService, 'logout');
            const findByIdSpy = jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
            const updateSpy = jest.spyOn(userService, 'update').mockResolvedValue(updateResult);

            // When
            const result = await authService.logout(userId);

            // Then
            expect(logoutSpy).toHaveBeenCalledWith(userId);
            expect(findByIdSpy).toHaveBeenCalledWith(userId);
            expect(updateSpy).toHaveBeenCalledWith(userId, { refreshToken: null });
            expect(result).toBe(updateResult);
        })

        it('실패_userId와_일치하는_유저_없음', async () => {
            // Given
            const userId = 10;
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
        const user: User = User.of(
            'a@a.com',
            'password',
            'add',
            'nick'
        );
        user.refreshToken = 'some_refresh_token';

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