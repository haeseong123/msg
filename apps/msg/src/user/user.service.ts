import { User } from '@app/msg-core/user/user.entity';
import { Injectable } from '@nestjs/common';
import { UserSignupDto } from './dto/user.signup.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
    constructor(private userRepository: UserRepository) { }

    async findUserByEmail(email: string): Promise<User | undefined> {
        return await this.userRepository.findOneBy({ email })
    }

    async findUserById(id: number): Promise<User | undefined> {
        return await this.userRepository.findOneBy({ id })
    }

    async saveUser(signupDto: UserSignupDto) {
        return await this.userRepository.save(await UserSignupDto.toUser(signupDto))
    }

    async updateUser(id: number, data: Partial<User>) {
        return await this.userRepository.update(id, data);
    }
}
