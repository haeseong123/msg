import { User } from "@app/msg-core/entities/user/user.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { UserSigninDto } from "../../user/dto/user-signin.dto";
import { UserSignupDto } from "../../user/dto/user-signup.dto";
import { UserDto } from "../../user/dto/user.dto";
import { AuthController } from "../auth.controller"
import { AuthService } from "../auth.service";
import { JwtPayload } from "../jwt/jwt-payload";
import { MsgToken } from "../jwt/msg-token";

describe('AuthController', () => {
    let authController: AuthController;
    let authService: AuthService;

    beforeEach(async () => {
        const authServiceMock = {
            signup: jest.fn(),
            signin: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn(),
        }

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: authServiceMock
                }
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('회원_가입', () => {
        it('성공', async () => {
            // Given
            const signupDto: UserSignupDto = {
                email: "email",
                password: "password",
                address: "address",
                nickname: "nickname",
            }
            const user: User = User.of(
                signupDto.email,
                signupDto.password,
                signupDto.address,
                signupDto.nickname
            );
            user.id = 1;
            const userDto: UserDto = UserDto.of(
                user.id,
                user.email,
                user.address,
                user.nickname
            );
            const signupControllerSpy = jest.spyOn(authController, 'signup');
            const signupServiceSpy = jest.spyOn(authService, 'signup').mockResolvedValue(user);

            // When
            const result = await authController.signup(signupDto)

            // Then
            expect(signupControllerSpy).toHaveBeenCalledWith(signupDto);
            expect(signupServiceSpy).toHaveBeenCalledWith(signupDto);
            expect(result).toStrictEqual(userDto);
        });
    });

    describe('로그인', () => {
        it('성공', async () => {
            // Given
            const signinDto: UserSigninDto = {
                email: 'test@test.com',
                password: 'test123',
            };
            const msgToken: MsgToken = { accessToken: 'access token', refreshToken: 'refresh token' };
            const signinControllerSpy = jest.spyOn(authController, 'signin');
            const signinServiceSpy = jest.spyOn(authService, 'signin').mockResolvedValue(msgToken)

            // When
            const result = await authController.signin(signinDto);

            // Then
            expect(signinControllerSpy).toHaveBeenCalledWith(signinDto);
            expect(signinServiceSpy).toHaveBeenCalledWith(signinDto);
            expect(result).toBe(msgToken);
        });
    });

    describe('로그아웃', () => {
        it('성공', async () => {
            // Given
            const sub = 1
            const logoutControllerSpy = jest.spyOn(authController, 'logout');
            const logoutServiceSpy = jest.spyOn(authService, 'logout');

            // When
            const result = await authController.logout(sub);

            // Then
            expect(logoutControllerSpy).toHaveBeenCalledWith(sub);
            expect(logoutServiceSpy).toHaveBeenCalledWith(sub);
            expect(result).toBe(undefined);
        });
    });

    describe('토큰_갱신', () => {
        it('성공', async () => {
            // Given
            const tokenPayload: JwtPayload & { refreshToken: string } = {
                sub: 1,
                email: 'test@example.com',
                refreshToken: 'refresh_token'
            }
            const msgToken: MsgToken = { accessToken: 'new_access_token', refreshToken: 'new_refresh_tokeb' }
            const refreshTokenControllerSpy = jest.spyOn(authController, 'refreshToken');
            const refreshTokenServiceSpy = jest.spyOn(authService, 'refreshToken').mockResolvedValue(msgToken);

            // When
            const result = await authController.refreshToken(tokenPayload)

            // Then
            expect(refreshTokenControllerSpy).toHaveBeenCalledWith(tokenPayload);
            expect(refreshTokenServiceSpy).toHaveBeenCalledWith(tokenPayload.sub, tokenPayload.email, tokenPayload.refreshToken);
            expect(result).toStrictEqual(msgToken);
        })
    })
})