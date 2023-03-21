import { User } from "@app/msg-core/entities/user/user.entity";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import { UserSigninDto } from "../../user/dto/user-signin.dto";
import { UserSignupDto } from "../../user/dto/user-signup.dto";
import { UserService } from "../../user/user.service";
import { AuthService } from "../auth.service"
import { JwtPayload } from "../jwt/jwt-payload";
import { UserIncorrectEmailException } from "../../exceptions/user/user-incorrect-email.exception";
import { UserIncorrectPasswordException } from "../../exceptions/user/user-incorrect-password.exception";
import { UserDto } from "../../user/dto/user.dto";
import { UnauthorizedAccessException } from "../../exceptions/auth/unauthorized-access.exception";
import { TokenExpiredException } from "../../exceptions/auth/token-expired.exception";

describe('AuthService', () => {
    let authService: AuthService;
    let userService: UserService;
    let jwtService: JwtService;

    beforeEach(async () => {
        const userServiceMock = {
            save: jest.fn(),
            findUserEntityByEmail: jest.fn(),
            update: jest.fn(),
            findUserEntityById: jest.fn()
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
            const signupDto: UserSignupDto = {
                email: "test@asd.com",
                password: "123qwe",
                address: "address",
                nickname: "nickname",
            };
            const userDto: UserDto = {
                id: 1,
                email: signupDto.email,
                address: signupDto.address,
                nickname: signupDto.nickname,
            };
            const signupSpy = jest.spyOn(authService, 'signup');
            const saveSpy = jest.spyOn(userService, 'save').mockResolvedValue(userDto);

            // When
            const result = await authService.signup(signupDto);

            // Then
            expect(signupSpy).toHaveBeenCalledWith(signupDto);
            expect(saveSpy).toHaveBeenCalledWith(signupDto);
            expect(result).toBe(userDto);
        });
    })

    describe('로그인', () => {
        const user: User = {
            id: 1,
            email: 'test@test.com',
            password: 'password123',
            address: 'test_address',
            nickname: 'hs',
            refreshToken: null,
            userChatRooms: [],
            sentMessages: [],
            relationshipFromMe: [],
            relationshipToMe: [],
            notifications: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const userSigninDto: UserSigninDto = {
            ...user
        };

        it('성공', async () => {
            // Given
            const tokenString = 'token';
            const payload: JwtPayload = { sub: user.id, email: user.email };

            const signinSpy = jest.spyOn(authService, 'signin');
            const findUserEntityByEmailSpy = jest.spyOn(userService, 'findUserEntityByEmail').mockResolvedValue(user);
            const compareSpy = jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);
            const jwtSignSpy = jest.spyOn(jwtService, 'sign').mockImplementation(() => tokenString);
            const updateSpy = jest.spyOn(userService, 'update').mockResolvedValue({ refreshToken: tokenString });

            // When
            const result = await authService.signin(userSigninDto);

            // Then
            expect(signinSpy).toHaveBeenCalledWith(userSigninDto);
            expect(findUserEntityByEmailSpy).toHaveBeenCalledWith(userSigninDto.email);
            expect(compareSpy).toHaveBeenCalledWith(userSigninDto.password, user.password);
            expect(jwtSignSpy).toHaveBeenCalledTimes(2);
            expect(jwtSignSpy).toHaveBeenCalledWith(
                payload,
                { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME }
            );
            expect(jwtSignSpy).toHaveBeenCalledWith(
                payload,
                { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME }
            );
            expect(updateSpy).toHaveBeenCalledWith(user.id, { refreshToken: tokenString });
            expect(result.accessToken).toBe(tokenString);
            expect(result.refreshToken).toBe(tokenString);
        });

        it('실패_이메일_불일치', async () => {
            // Given
            const signinSpy = jest.spyOn(authService, 'signin');
            const findUserEntityByEmailSpy = jest.spyOn(userService, 'findUserEntityByEmail').mockResolvedValue(undefined);

            // When
            const result = authService.signin(userSigninDto);

            // Then
            await expect(result).rejects.toThrow(UserIncorrectEmailException);
            expect(signinSpy).toHaveBeenCalledWith(userSigninDto);
            expect(findUserEntityByEmailSpy).toHaveBeenCalledWith(userSigninDto.email);
        });

        it('실패_비밀번호_불일치', async () => {
            // Given
            const signinSpy = jest.spyOn(authService, 'signin');
            const findUserEntityByEmailSpy = jest.spyOn(userService, 'findUserEntityByEmail').mockResolvedValue(user);
            const compareSpy = jest.spyOn(bcrypt, 'compare').mockImplementation((_dtoPassword, _userPassword) => false);

            // When
            const resultPromise = authService.signin(userSigninDto);

            // Then
            await expect(resultPromise).rejects.toThrow(UserIncorrectPasswordException);
            expect(signinSpy).toHaveBeenCalledWith(userSigninDto);
            expect(findUserEntityByEmailSpy).toHaveBeenCalledWith(userSigninDto.email);
            expect(compareSpy).toHaveBeenCalledWith(userSigninDto.password, user.password);
        });
    })

    describe('로그_아웃', () => {
        it('성공', async () => {
            // Given
            const id = 10;
            const logoutSpy = jest.spyOn(authService, 'logout');
            const updateSpy = jest.spyOn(userService, 'update').mockResolvedValue({ refreshToken: null });

            // When
            const result = await authService.logout(id);

            // Then
            expect(logoutSpy).toHaveBeenCalledWith(id);
            expect(updateSpy).toHaveBeenCalledWith(id, { refreshToken: null });
            expect(result).toBe(true);
        })
    })

    describe('토큰_재발급', () => {
        const user: User = {
            id: 1,
            email: 'test@test.com',
            password: 'password123',
            address: 'test_address',
            nickname: 'hs',
            refreshToken: 'refresh_token',
            userChatRooms: [],
            sentMessages: [],
            relationshipFromMe: [],
            relationshipToMe: [],
            notifications: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it('성공', async () => {
            // Given
            const tokenString = 'token';
            const payload: JwtPayload = { sub: user.id, email: user.email };

            const refreshTokenSpy = jest.spyOn(authService, 'refreshToken');
            const findUserEntityByIdSpy = jest.spyOn(userService, 'findUserEntityById').mockResolvedValue(user);
            const jwtSignSpy = jest.spyOn(jwtService, 'sign').mockImplementation(() => tokenString);
            const updateSpy = jest.spyOn(userService, 'update').mockResolvedValue({ refreshToken: tokenString });

            // When
            const result = await authService.refreshToken(user.id, user.email, user.refreshToken);

            // Then
            expect(refreshTokenSpy).toBeCalledWith(user.id, user.email, user.refreshToken);
            expect(findUserEntityByIdSpy).toBeCalledWith(user.id);
            expect(jwtSignSpy).toHaveBeenCalledTimes(2);
            expect(jwtSignSpy).toHaveBeenCalledWith(
                payload,
                { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME }
            );
            expect(jwtSignSpy).toHaveBeenCalledWith(
                payload,
                { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME }
            );
            expect(updateSpy).toBeCalledWith(user.id, { refreshToken: tokenString });
            expect(result.accessToken).toBe(tokenString);
            expect(result.refreshToken).toBe(tokenString);
        });

        it('실패_id와_일치하는_user가_없음', async () => {
            // Given
            const refreshTokenSpy = jest.spyOn(authService, 'refreshToken');
            const findUserEntityByIdSpy = jest.spyOn(userService, 'findUserEntityById').mockResolvedValue(null);

            // When
            const resultPromise = authService.refreshToken(user.id, user.email, user.refreshToken);

            // Then
            await expect(resultPromise).rejects.toThrow(UnauthorizedAccessException);
            expect(refreshTokenSpy).toBeCalledWith(user.id, user.email, user.refreshToken);
            expect(findUserEntityByIdSpy).toBeCalledWith(user.id);
        });

        it('실패_client가_보낸_refreshToken과_DB에_저장된_refreshToken_값이_다름', async () => {
            // Given
            const otherRefreshToken = 'other_refresh_token';
            const refreshTokenSpy = jest.spyOn(authService, 'refreshToken');
            const findUserEntityByIdSpy = jest.spyOn(userService, 'findUserEntityById').mockResolvedValue(user);

            // When
            const resultPromise = authService.refreshToken(user.id, user.email, otherRefreshToken);

            // Then
            await expect(resultPromise).rejects.toThrow(TokenExpiredException);
            expect(refreshTokenSpy).toBeCalledWith(user.id, user.email, otherRefreshToken);
            expect(findUserEntityByIdSpy).toBeCalledWith(user.id);
        });
    });
});