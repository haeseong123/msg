import { Injectable } from '@nestjs/common';
import { UserSigninDto } from '../user/dto/user-signin.dto';
import { compare } from 'bcrypt';
import { UserIncorrectPasswordException } from '../user/exception/user-incorrect-password.exception';
import { User } from '@app/msg-core/entities/user/user.entity';
import { UserEmailAlreadyExistsException } from '../user/exception/user-email-already-exists.exception';
import { UsingRefreshTokenDto } from './dto/using-refresh-token.dto';
import { UserSingUpDto } from '../user/dto/user-signup.dto';
import { UserService } from '../user/user.service';
import { TokenService } from '@app/msg-core/jwt/token.service';
import { MsgTokenDto } from '@app/msg-core/jwt/dto/msg-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * 회원가입
   */
  async signup(dto: UserSingUpDto): Promise<User> {
    /**
     * client가 보낸 dto에 있는 email로 user를 가져옵니다.
     */
    const duplicateEmailUser = await this.userService.findByEmail(
      dto.emailInfoDto,
    );

    /**
     * 이메일 중복을 확인합니다.
     */
    if (duplicateEmailUser) {
      throw new UserEmailAlreadyExistsException();
    }

    const user = await dto.toEntity();

    /**
     * user를 DB에 저장합니다. (회원가입)
     */
    const savedUser = await this.userService.saveByEntity(user);

    return savedUser;
  }

  /**
   * 로그인
   */
  async signin(dto: UserSigninDto): Promise<MsgTokenDto> {
    /**
     * dto.email로 user를 가져옵니다.
     */
    const user = await this.userService.findByEmailOrThrow(dto.emailInfoDto);

    /**
     * dto.password와 user.password를 비교합니다.
     */
    const isValidPassword = await compare(dto.password, user.password);

    if (!isValidPassword) {
      throw new UserIncorrectPasswordException();
    }

    /**
     * 새 토큰을 발급받습니다.
     */
    const tokenDto = await this.generateToken(user);

    return tokenDto;
  }

  /**
   * 로그아웃
   */
  async logout(id: number): Promise<boolean> {
    /**
     * id로 user를 가져옵니다.
     */
    const user = await this.userService.findByIdOrThrow(id);

    /**
     * refreshToken을 폐기합니다.
     */
    user.removeRefreshToken();

    /**
     * 변경사항을 DB에 저장합니다.
     */
    await this.userService.saveByEntity(user);

    return true;
  }

  /**
   * refreshToken을 사용하여 새 토큰 발행
   */
  async refreshToken(dto: UsingRefreshTokenDto): Promise<MsgTokenDto> {
    /**
     * dto.id로 user를 가져옵니다.
     */
    const user = await this.userService.findByIdOrThrow(dto.userId);

    /**
     * user.refreshToken과 dto.refreshToken이 일치하는지 확인합니다.
     */
    user.validateRefreshToken(dto.refreshToken);

    /**
     * 새 토큰을 발급받습니다.
     */
    const tokenDto = await this.generateToken(user);

    return tokenDto;
  }

  /**
   * 새 토큰 발행
   */
  async generateToken(user: User): Promise<MsgTokenDto> {
    /**
     * 토큰을 생성합니다.
     */
    const tokenDto = this.tokenService.generateToken({
      sub: user.id,
      email: user.emailInfo.email,
      nickname: user.nickname,
    });

    /**
     * refreshToken을 등록합니다.
     */
    user.createRefreshToken(tokenDto.refreshToken);

    /**
     * DB에 변경사항을 저장합니다.
     */
    await this.userService.saveByEntity(user);

    return tokenDto;
  }
}
