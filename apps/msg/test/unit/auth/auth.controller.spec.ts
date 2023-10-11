import { EmailInfo } from "@app/msg-core/entities/user/email-info";
import { User } from "@app/msg-core/entities/user/user.entity";
import { TestingModule, Test } from "@nestjs/testing";
import { AuthController } from "apps/msg/src/auth/auth.controller";
import { AuthService } from "apps/msg/src/auth/auth.service";
import { UsingRefreshTokenDto } from "apps/msg/src/auth/dto/using-refresh-token.dto";
import { MsgTokenDto } from "apps/msg/src/auth/jwt/dto/msg-token.dto";
import { UserEmailInfoDto } from "apps/msg/src/user/dto/user-email-info.dto";
import { UserSigninDto } from "apps/msg/src/user/dto/user-signin.dto";
import { UserSingUpDto } from "apps/msg/src/user/dto/user-signup.dto";
import { UserDto } from "apps/msg/src/user/dto/user.dto";

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

    describe('회원 가입', () => {
        it('성공', async () => {
            // Given
            const userEmailInfoDto = new UserEmailInfoDto('hs@naver.com');
            const password = 'password';
            const nickname = 'nickname';

            const userSingUpDto = new UserSingUpDto(userEmailInfoDto, password, nickname);
            const user = User.of(EmailInfo.of(userEmailInfoDto.emailLocal, userEmailInfoDto.emailDomain), password, nickname, null, []);
            const userDto = UserDto.of(user);
            jest.spyOn(authService, 'signup').mockResolvedValue(user);

            // When
            const result = await authController.signup(userSingUpDto);

            // Then
            expect(result).toStrictEqual(userDto);
        });
    });

    describe('로그인', () => {
        it('성공', async () => {
            // Given
            const signinDto = new UserSigninDto(new UserEmailInfoDto('hs@naver.com'), 'password');
            const token = new MsgTokenDto('token', 'refresh_token');
            jest.spyOn(authService, 'signin').mockResolvedValue(token);

            // When
            const result = await authController.signin(signinDto);

            // Then
            expect(result).toBe(token);
        });
    });

    describe('로그아웃', () => {
        it('성공', async () => {
            // Given
            const sub = 1
            const expectResult = true
            jest.spyOn(authService, 'logout').mockResolvedValue(expectResult);

            // When
            const result = await authController.logout(sub);

            // Then
            expect(result).toBe(expectResult);
        });
    });

    describe('토큰_갱신', () => {
        it('성공', async () => {
            // Given
            const dto = new UsingRefreshTokenDto(1, "refresh_token");
            const newToken = new MsgTokenDto('new_token', 'new_ref_token');
            jest.spyOn(authService, 'refreshToken').mockResolvedValue(newToken);

            // When
            const result = await authController.refreshToken(dto);

            // Then
            expect(result).toStrictEqual(newToken);
        })
    })
})