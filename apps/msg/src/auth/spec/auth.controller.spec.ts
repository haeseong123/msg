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
        jest.clearAllMocks()
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
            const userDto: UserDto = {
                id: 1,
                email: signupDto.email,
                address: signupDto.address,
                nickname: signupDto.nickname,
            }
            const signupControllerSpy = jest.spyOn(authController, 'signup');
            const signupServiceSpy = jest.spyOn(authService, 'signup').mockResolvedValue(userDto);

            // When
            const result = await authController.signup(signupDto)

            // Then
            expect(signupControllerSpy).toHaveBeenCalledWith(signupDto);
            expect(signupServiceSpy).toHaveBeenCalledWith(signupDto);
            expect(result).toBe(userDto);
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
            const logoutServiceSpy = jest.spyOn(authService, 'logout').mockResolvedValue(true);

            // When
            const result = await authController.logout(sub);

            // Then
            expect(logoutControllerSpy).toHaveBeenCalledWith(sub);
            expect(logoutServiceSpy).toHaveBeenCalledWith(sub);
            expect(result).toBe(true);
        });
    });

    describe('토큰_갱신', () => {
        it('성공', async () => {
            // Given
            const mockPayload: JwtPayload & { refreshToken: string } = {
                sub: 1,
                email: 'test@example.com',
                refreshToken: 'refresh_token'
            }
            const msgToken: MsgToken = { accessToken: 'new_access_token', refreshToken: 'new_refresh_tokeb' }
            const refreshTokenControllerSpy = jest.spyOn(authController, 'refreshToken');
            const refreshTokenServiceSpy = jest.spyOn(authService, 'refreshToken').mockResolvedValue(msgToken);

            // When
            const result = await authController.refreshToken(mockPayload)

            // Then
            expect(refreshTokenControllerSpy).toHaveBeenCalledWith(mockPayload);
            expect(refreshTokenServiceSpy).toHaveBeenCalledWith(mockPayload.sub, mockPayload.email, mockPayload.refreshToken);
            expect(result.accessToken).toBe(msgToken.accessToken);
            expect(result.refreshToken).toBe(msgToken.refreshToken);
        })
    })
})