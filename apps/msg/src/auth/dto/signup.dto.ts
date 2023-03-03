import { IsEmail, IsNotEmpty } from 'class-validator';
import { hashSync } from 'bcrypt';
import { Transform, Type } from 'class-transformer';
import { User } from '@app/msg-core/user/user.entity';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  nickname: string;

  @Transform(({ value }) => hashSync(value + process.env.PEPPER, 10))
  passwordHash: string;

  toUser(): User {
    const user = new User();
    user.email = this.email;
    user.password = this.passwordHash;
    user.address = this.address;
    user.nickname = this.nickname;
    return user;
  }
}