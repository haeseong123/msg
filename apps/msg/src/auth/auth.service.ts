import { User } from "@app/msg-core/user/user.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SigninDto } from "./dto/signin.dto";
import { SignupDto } from "./dto/signup.dto";

@Injectable()
export class AuthService {
    constructor() { }

    async signup(dto: SignupDto): Promise<User> {
        return User.save(dto.toUser())
    }

    async signin(dto: SigninDto): Promise<User> {
        const user = await User.findOneBy({ email: dto.email })

        if (user.password == dto.password) {
            throw console.error("아님!");
        }

        return user;
    }
}