import { User } from '@app/msg-core/entities/user/user.entity';
import { Injectable } from '@nestjs/common';
import { UserEmailConflictException } from '../exceptions/user/user-email-conflict.exception';
import { UserSignupDto } from './dto/user-signup.dto';
import { UserDto } from './dto/user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
    constructor(private userRepository: UserRepository) { }

    async findUserByEmail(email: string): Promise<User | undefined> {
        return await this.userRepository.findOneBy({ email })
    }

    async findUserById(id: number): Promise<User | undefined> {
        return await this.userRepository.findOneBy({ id })
    }

    async save(dto: UserSignupDto): Promise<UserDto> {
        if (await this.findUserByEmail(dto.email)) {
            throw new UserEmailConflictException();
        }

        const result = await this.userRepository.save(await UserSignupDto.toUser(dto));
        return new UserDto(
            result.id,
            result.email,
            result.address,
            result.nickname
        );
    }

    async update(id: number, data: Partial<User>): Promise<Partial<User>> {
        await this.userRepository.update(id, data);

        return data;
    }
}
