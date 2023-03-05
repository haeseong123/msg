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
    const user = new User();
    user.email = dto.email;
    user.password = await hashPassword(dto.password);
    user.address = dto.address;
    user.nickname = dto.nickname;
    return user;
  }
}