import { User } from '@app/msg-core/entities/user/user.entity';
import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserEmailInfoDto } from './dto/user-email-info.dto';

@Injectable()
export class UserService {
    constructor(private userRepository: UserRepository) { }

    async findByEmail(dto: UserEmailInfoDto): Promise<User | null> {
        return await this.userRepository.findByEmail(dto.emailLocal, dto.emailDomain);
    }

    async findById(id: number): Promise<User | null> {
        return await this.userRepository.findById(id);
    }

    async findByIds(ids: number[]): Promise<User[]> {
        return await this.userRepository.findByIds(ids);
    }

    async save(user: User): Promise<User> {
        return await this.userRepository.save(user);
    }
}