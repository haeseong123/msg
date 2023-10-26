import { EmailInfo } from '@app/msg-core/entities/user/email-info';
import { User } from '@app/msg-core/entities/user/user.entity';
import { MsgTokenDto } from '@app/msg-core/jwt/dto/msg-token.dto';
import { TokenService } from '@app/msg-core/jwt/token.service';
import { TestingModule, Test } from '@nestjs/testing';
import { AuthService } from 'apps/msg/src/auth/auth.service';
import { UsingRefreshTokenDto } from 'apps/msg/src/auth/dto/using-refresh-token.dto';
import { UserEmailAlreadyExistsException } from 'apps/msg/src/user/exception/user-email-already-exists.exception';
import { UserIncorrectPasswordException } from 'apps/msg/src/user/exception/user-incorrect-password.exception';
import { UserEmailInfoDto } from 'apps/msg/src/user/dto/user-email-info.dto';
import { UserSigninDto } from 'apps/msg/src/user/dto/user-signin.dto';
import { UserSingUpDto } from 'apps/msg/src/user/dto/user-signup.dto';
import { UserService } from 'apps/msg/src/user/user.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let tokenService: TokenService;

  beforeEach(async () => {
    const userServiceMock = {
      findByEmail: jest.fn(),
      saveByEntity: jest.fn(),
      findByEmailOrThrow: jest.fn(),
      findByIdOrThrow: jest.fn(),
    };
    const tokenServiceMock = {
      generateToken: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: TokenService,
          useValue: tokenServiceMock,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    tokenService = module.get<TokenService>(TokenService);
  });

  describe('회원가입', () => {
    let userSingupDto: UserSingUpDto;
    let user: User;

    beforeEach(() => {
      const userEmailInfoDto = new UserEmailInfoDto('hs@naver.com');
      const password = 'password';
      const nickname = 'nickname';

      userSingupDto = new UserSingUpDto(userEmailInfoDto, password, nickname);
      user = User.of(
        EmailInfo.of(userEmailInfoDto.emailLocal, userEmailInfoDto.emailDomain),
        password,
        nickname,
        null,
        [],
      );
    });

    it('성공', async () => {
      // Given
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
      jest
        .spyOn(userSingupDto, 'toEntity')
        .mockImplementation(async () => user);
      jest.spyOn(userService, 'saveByEntity').mockResolvedValue(user);

      // When
      const result = await authService.signup(userSingupDto);

      // Then
      expect(result).toBe(user);
    });

    it('실패: 이메일 중복', async () => {
      // Given
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user);

      // When
      const resultPromise = authService.signup(userSingupDto);

      // Then
      await expect(resultPromise).rejects.toThrow(
        UserEmailAlreadyExistsException,
      );
    });
  });

  describe('로그인', () => {
    let userSigninDto: UserSigninDto;
    let user: User;

    beforeEach(() => {
      const userEmailInfoDto = new UserEmailInfoDto('hs@naver.com');
      const password = 'password';

      userSigninDto = new UserSigninDto(userEmailInfoDto, password);
      user = User.of(
        EmailInfo.of(userEmailInfoDto.emailLocal, userEmailInfoDto.emailDomain),
        password,
        'nickname',
        '',
        [],
      );
    });

    it('성공', async () => {
      // Given
      const tokenDto = new MsgTokenDto('token', 'ref_token');

      jest.spyOn(userService, 'findByEmailOrThrow').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);
      jest.spyOn(tokenService, 'generateToken').mockReturnValue(tokenDto);

      // When
      const result = await authService.signin(userSigninDto);

      // Then
      expect(result).toStrictEqual(tokenDto);
    });

    it('실패: 비밀번호 불일치', async () => {
      // Given
      jest.spyOn(userService, 'findByEmailOrThrow').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);

      // When
      const resultPromise = authService.signin(userSigninDto);

      // Then
      await expect(resultPromise).rejects.toThrow(
        UserIncorrectPasswordException,
      );
    });
  });

  describe('로그아웃', () => {
    let userId: number;
    let user: User;

    beforeEach(() => {
      userId = 1;
      user = User.of(
        EmailInfo.of('local', 'domain'),
        'password',
        'nickname',
        'ref_token',
        [],
      );
    });

    it('성공', async () => {
      // Given
      jest.spyOn(userService, 'findByIdOrThrow').mockResolvedValue(user);
      jest.spyOn(user, 'removeRefreshToken').mockImplementation(() => {});
      jest
        .spyOn(userService, 'saveByEntity')
        .mockImplementation(async (user) => user);

      // When
      const result = await authService.logout(userId);

      // Then
      expect(result).toBe(true);
    });
  });

  describe('refreshToken을 사용하여 새 토큰 발행', () => {
    let usingRefreshTokenDto: UsingRefreshTokenDto;
    let user: User;

    beforeEach(() => {
      const id = 1;
      const refreshToken = 'ref_token';

      usingRefreshTokenDto = new UsingRefreshTokenDto(id, refreshToken);
      user = User.of(
        EmailInfo.of('local', 'domain'),
        'password',
        'nickname',
        refreshToken,
        [],
      );
    });

    it('성공', async () => {
      // Given
      const tokenDto = new MsgTokenDto('new_token', 'new_ref_token');

      jest.spyOn(userService, 'findByIdOrThrow').mockResolvedValue(user);
      jest.spyOn(user, 'validateRefreshToken').mockImplementation(() => {});
      jest.spyOn(tokenService, 'generateToken').mockReturnValue(tokenDto);

      // When
      const result = await authService.refreshToken(usingRefreshTokenDto);

      // Then
      expect(result).toStrictEqual(tokenDto);
    });
  });

  describe('새 토큰 발행', () => {
    it('성공', async () => {
      // Given
      const user = User.of(EmailInfo.of('local', 'domain'), '', '', '', []);
      user.id = 1;
      const tokenDto = new MsgTokenDto('new_token', 'new_ref_token');

      jest.spyOn(tokenService, 'generateToken').mockReturnValue(tokenDto);
      jest
        .spyOn(user, 'createRefreshToken')
        .mockImplementation((_refToken) => {});
      jest.spyOn(userService, 'saveByEntity').mockResolvedValue(user);

      // When
      const result = await authService.generateToken(user);

      // Then
      expect(result).toStrictEqual(tokenDto);
    });
  });
});
