import { User } from "@app/msg-core/user/user.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { UserSigninDto } from "../../user/dto/user.signin.dto";
import { UserSignupDto } from "../../user/dto/user.signup.dto";
import { AuthController } from "../auth.controller"
import { AuthService } from "../auth.service";
import { JwtPayload } from "../jwt/jwt.payload";
import { MsgToken } from "../jwt/msg.token";

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
        it('회원_가입_성공', async () => {
            // Given
            const user: User = {
                id: 1,
                email: 'test@example.com',
                password: 'password123',
                address: 'test_address',
                nickname: 'hs',
                refreshToken: null,
                createdAt: new Date(),
                updatedAt: new Date()
            }
            const signupDto: UserSignupDto = { ...user, };
            const signupSpy = jest.spyOn(authService, 'signup').mockResolvedValue(user);

            // When
            const signupResult = await authController.signup(signupDto)

            // Then
            expect(signupResult).toBe(user)
            expect(signupSpy).toHaveBeenCalledWith(signupDto)
        });
    });

    describe('signin', () => {
        it('로그인', async () => {
            // Given
            const signinDto: UserSigninDto = {
                email: 'test@test.com',
                password: 'test123',
            };
            const msgToken: MsgToken = { accessToken: 'access token', refreshToken: 'refresh token' }
            const signinSpy = jest.spyOn(authService, 'signin').mockResolvedValue(msgToken)

            // When
            const signinResult = await authController.signin(signinDto)

            // Then
            expect(signinResult).toBe(msgToken)
            expect(signinSpy).toHaveBeenCalledWith(signinDto)
        })
    })

    describe('logout', () => {
        it('로그 아웃', async () => {
            // Given
            const mockPayload: JwtPayload = { sub: 1, email: 'test@example.com' }
            const req = { user: mockPayload }
            const logoutSpy = jest.spyOn(authService, 'logout').mockResolvedValue(true);

            // When
            const logoutResult = await authController.logout(req);

            // Then
            expect(logoutResult).toBe(true);
            expect(logoutSpy).toHaveBeenCalledWith(mockPayload.sub)
        })
    });

    describe('refresh-token', () => {
        it('토큰 갱신', async () => {
            // Given
            const mockPayload: JwtPayload & { refreshToken: string } = {
                sub: 1,
                email: 'test@example.com',
                refreshToken: 'refresh token'
            }
            const request = { user: mockPayload }
            const msgToken: MsgToken = { accessToken: 'access_token', refreshToken: 'refresh_tokeb' }
            const refreshTokenSpy = jest.spyOn(authService, 'refreshToken').mockResolvedValue(msgToken)

            // When
            const refreshTokenResult = await authController.refreshToken(request)

            // Then
            expect(refreshTokenResult.accessToken).toBe(msgToken.accessToken)
            expect(refreshTokenResult.refreshToken).toBe(msgToken.refreshToken)
            expect(refreshTokenSpy).toHaveBeenCalledWith(mockPayload.sub, mockPayload.email, mockPayload.refreshToken)
        })
    })
})