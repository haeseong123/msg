import { IsEmail, IsNotEmpty } from 'class-validator';
import { User } from '@app/msg-core/entities/user/user.entity';
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

  async toEntity(): Promise<User> {
    return new User(
      this.email,
      await hashString(this.password),
      this.address,
      this.nickname
    );
  }
}