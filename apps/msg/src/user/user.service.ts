import { User } from '@app/msg-core/entities/user/user.entity';
import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserEmailInfoDto } from './dto/user-email-info.dto';
import { UserNotFoundedException } from './user-relation/exceptions/user-not-found.exception';

@Injectable()
export class UserService {
    constructor(private userRepository: UserRepository) { }

    async findByEmail(dto: UserEmailInfoDto): Promise<User | null> {
        return await this.userRepository.findByEmail(dto.emailLocal, dto.emailDomain);
    }

    async findByIdOrThrow(id: number): Promise<User> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new UserNotFoundedException();
        }

        return user;
    }

    async findByIds(ids: number[]): Promise<User[]> {
        return await this.userRepository.findByIds(ids);
    }

    async save(user: User): Promise<User> {
        return await this.userRepository.save(user);
    }
}