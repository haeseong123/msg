import { UserEmailConflictException } from "@app/msg-core/exceptions/user/user-email-conflict.exception";
import { User } from "@app/msg-core/entities/user/user.entity";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import { UserSigninDto } from "../../user/dto/user-signin.dto";
import { UserSignupDto } from "../../user/dto/user-signup.dto";
import { UserService } from "../../user/user.service";
import { AuthService } from "../auth.service"
import { JwtPayload } from "../jwt/jwt-payload";
import { UserIncorrectEmailException } from "@app/msg-core/exceptions/user/user-incorrect-email.exception";
import { UserIncorrectPasswordException } from "@app/msg-core/exceptions/user/user-incorrect-password.exception";

describe('AuthService', () => {
    let authService: AuthService;
    let userService: UserService;
    let jwtService: JwtService;

    beforeEach(async () => {
        const userServiceMock = {
            findUserByEmail: jest.fn(),
            findUserById: jest.fn(),
            saveUserByDto: jest.fn(),
            updateUser: jest.fn(),
        }
        const jwtServiceMock = {
            sign: jest.fn()
        }
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
        }).compile()

        authService = module.get<AuthService>(AuthService)
        userService = module.get<UserService>(UserService)
        jwtService = module.get<JwtService>(JwtService)
    });

    afterEach(() => {
        jest.clearAllMocks()
    });

    describe('회원_가입', () => {
        const user: User = {
            id: 1,
            email: 'test@example.com',
            password: 'password123',
            address: 'test_address',
            nickname: 'hs',
            refreshToken: null,
            userChatRooms: [],
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date()
        }
        const userSignupDto: UserSignupDto = {
            ...user
        }

        it('회원_가입_성공', async () => {
            // Given
            const findUserByEmailSpy = jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(undefined);
            const saveUserSpy = jest.spyOn(userService, 'saveUserByDto').mockResolvedValue(user);

            // When
            const result = await authService.signup(userSignupDto);

            // Then
            expect(findUserByEmailSpy).toHaveBeenCalledWith(userSignupDto.email);
            expect(saveUserSpy).toHaveBeenCalledWith(userSignupDto);
            expect(result).toBe(user)
        })

        it('회원_가입_이메일_중복', async () => {
            // Given
            const findUserByEmailSpy = jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user)

            // When
            const signupPromise = authService.signup(userSignupDto);

            // Then
            await expect(signupPromise).rejects.toThrow(UserEmailConflictException)
            expect(findUserByEmailSpy).toHaveBeenCalledWith(userSignupDto.email)
        })
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
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        const userSigninDto: UserSigninDto = {
            ...user
        }

        it('로그인_성공', async () => {
            // Given
            const findUserByEmailSpy = jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user);
            const compareSpy = jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);
            const jwtSignSpy = jest.spyOn(jwtService, 'sign').mockImplementation(() => 'token');

            const payload: JwtPayload = { sub: user.id, email: user.email }

            // When
            const signinResult = await authService.signin(userSigninDto);

            // Then
            expect(signinResult.accessToken).toBe('token');
            expect(signinResult.refreshToken).toBe('token');
            expect(findUserByEmailSpy).toHaveBeenCalledWith(userSigninDto.email);
            expect(compareSpy).toHaveBeenCalledWith(userSigninDto.password, user.password)
            expect(jwtSignSpy).toHaveBeenCalledTimes(2);
            expect(jwtSignSpy).toHaveBeenCalledWith(
                payload,
                { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME }
            )
            expect(jwtSignSpy).toHaveBeenCalledWith(
                payload,
                { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME }
            )
        })


        it('로그인_이메일_불일치', async () => {
            // Given
            const findUserByEmailSpy = jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(undefined);

            // When
            const signinPromise = authService.signin(userSigninDto)

            // Then
            await expect(signinPromise).rejects.toThrow(UserIncorrectEmailException)
            expect(findUserByEmailSpy).toHaveBeenCalledWith(userSigninDto.email)
        })

        it('로그인_비밀번호_불일치', async () => {
            // Given
            const findUserByEmailSpy = jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user);
            const compareSpy = jest.spyOn(bcrypt, 'compare').mockImplementation(() => false)

            // When
            const signinPromise = authService.signin(userSigninDto);

            // Then
            await expect(signinPromise).rejects.toThrow(UserIncorrectPasswordException)
            expect(findUserByEmailSpy).toHaveBeenCalledWith(userSigninDto.email)
            expect(compareSpy).toHaveBeenCalledWith(userSigninDto.password, user.password)
        })
    })

    describe('로그_아웃', () => {
        it('로그_아웃_성공', async () => {
            // Given
            const id = 10;
            const updateUserSpy = jest.spyOn(userService, 'updateUser').mockResolvedValue(1);

            // When
            const logoutResult = await authService.logout(id);

            // Then
            expect(logoutResult).toBe(true)
            expect(updateUserSpy).toHaveBeenCalledWith(id, { refreshToken: null })
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
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        const otherRefreshToken = 'other_refresh_token'

        it('토큰_재발급_성공', async () => {
            // Given
            const findUserByIdSpy = jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
            const jwtSignSpy = jest.spyOn(jwtService, 'sign').mockImplementation(() => 'token');
            const updateUserSpy = jest.spyOn(userService, 'updateUser').mockResolvedValue(1);

            const payload: JwtPayload = { sub: user.id, email: user.email }

            // When
            const tokenRefreshResult = await authService.refreshToken(user.id, user.email, user.refreshToken)

            // Then
            expect(tokenRefreshResult.accessToken).toBe('token');
            expect(tokenRefreshResult.refreshToken).toBe('token');
            expect(findUserByIdSpy).toBeCalledWith(user.id);
            expect(jwtSignSpy).toHaveBeenCalledTimes(2);
            expect(jwtSignSpy).toHaveBeenCalledWith(
                payload,
                { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME }
            )
            expect(jwtSignSpy).toHaveBeenCalledWith(
                payload,
                { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME }
            )
            expect(updateUserSpy).toBeCalledWith(user.id, { refreshToken: 'token' })
        })
    })
})