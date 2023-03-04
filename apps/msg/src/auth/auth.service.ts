import { UserEmailConflictException } from "@app/msg-core/user/exception/user.email.conflict.exception";
import { UserIncorrectEmailException } from "@app/msg-core/user/exception/user.incorrect.email.exception";
import { UserIncorrectPasswordException } from "@app/msg-core/user/exception/user.incorrect.password.exception";
import { User } from "@app/msg-core/user/user.entity";
import { Injectable } from "@nestjs/common";
import { compare } from "bcrypt";
import { SigninDto } from "./dto/signin.dto";
import { SignupDto } from "./dto/signup.dto";

@Injectable()
export class AuthService {
    constructor() { }

    async signup(dto: SignupDto): Promise<User> {
        const user = await User.findOneBy({ email: dto.email });

        if (user) {
            throw new UserEmailConflictException();
        }

        return User.save(await SignupDto.toUser(dto));
    }

    async signin(dto: SigninDto): Promise<User> {
        const user = await User.findOneBy({ email: dto.email });

        if (!user) {
            throw new UserIncorrectEmailException();
        }

        const isMatch = await compare(dto.password + process.env.PEPPER, user.password);

        if (!isMatch) {
            throw new UserIncorrectPasswordException();
        }

        return user;
    }
}