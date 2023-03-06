import { IsEmail, IsNotEmpty } from 'class-validator';
import { User } from '@app/msg-core/user/user.entity';
import { hashPassword } from '../../util/password.utils';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  nickname: string;

  static async toUser(dto: SignupDto): Promise<User> {
    return new User(
      dto.email,
      await hashPassword(dto.password),
      dto.address,
      dto.nickname
    );
  }
}