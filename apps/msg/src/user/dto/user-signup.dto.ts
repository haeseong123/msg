import { Expose, Exclude, Transform, Type } from 'class-transformer';
import {
  IsString,
  MinLength,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { UserEmailInfoDto } from './user-email-info.dto';
import { EmailInfo } from '@app/msg-core/entities/user/email-info';
import { hashString } from '../../common/util/hash-string';
import { User } from '@app/msg-core/entities/user/user.entity';

export class UserSingUpDto {
  @Expose({ name: 'email' })
  @Type(() => UserEmailInfoDto)
  @Transform(({ obj }) => new UserEmailInfoDto(obj['email']))
  @ValidateNested()
  private readonly _emailInfoDto: UserEmailInfoDto;

  @Expose({ name: 'password' })
  @Exclude({ toPlainOnly: true })
  @IsString()
  @MinLength(8)
  private readonly _password: string;

  @Expose({ name: 'nickname' })
  @IsString()
  @MinLength(2)
  @MaxLength(15)
  private readonly _nickname: string;

  constructor(
    emailInfoDto: UserEmailInfoDto,
    password: string,
    nickname: string,
  ) {
    this._emailInfoDto = emailInfoDto;
    this._password = password;
    this._nickname = nickname;
  }

  async toEntity(): Promise<User> {
    const email = EmailInfo.of(
      this.emailInfoDto.emailLocal,
      this.emailInfoDto.emailDomain,
    );
    const hashedPassword = await hashString(this._password);
    const refreshToken = null;
    const relation = [];

    return User.of(
      email,
      hashedPassword,
      this._nickname,
      refreshToken,
      relation,
    );
  }

  get emailInfoDto(): UserEmailInfoDto {
    return this._emailInfoDto;
  }

  get password(): string {
    return this._password;
  }

  get nickname(): string {
    return this._nickname;
  }
}
