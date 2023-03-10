import { IsEmail, IsNotEmpty } from 'class-validator';
import { User } from '@app/msg-core/user/user.entity';
import { hashString } from '../../util/hash.utils';

export class UserSignupDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  nickname: string;

  static async toUser(dto: UserSignupDto): Promise<User> {
    return new User(
      dto.email,
      await hashString(dto.password),
      dto.address,
      dto.nickname
    );
  }
}