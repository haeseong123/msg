import { User } from '@app/msg-core/entities/user/user.entity';
import { MsgTokenDto } from '@app/msg-core/jwt/dto/msg-token.dto';
import { Expose } from 'class-transformer';

export class SigninResponseDto {
  @Expose({ name: 'id' })
  private readonly _id: number;

  @Expose({ name: 'accessToken' })
  private readonly _accessToken: string;

  @Expose({ name: 'refreshToken' })
  private readonly _refreshToken: string;

  constructor(id: number, accessToken: string, refreshToken: string) {
    this._id = id;
    this._accessToken = accessToken;
    this._refreshToken = refreshToken;
  }

  static of(user: User, msgTokenDto: MsgTokenDto): SigninResponseDto {
    return new SigninResponseDto(
      user.id,
      msgTokenDto.accessToken,
      msgTokenDto.refreshToken,
    );
  }
}
