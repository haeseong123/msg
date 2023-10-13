import { User } from '@app/msg-core/entities/user/user.entity';
import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserEmailInfoDto } from './dto/user-email-info.dto';
import { UserNotFoundedException } from './exception/user-not-found.exception';
import { UserIncorrectEmailException } from './exception/user-incorrect-email.exception';

@Injectable()
export class UserService {
    constructor(private userRepository: UserRepository) { }

    /**
     * 이메일로 유저를 가져옵니다.
     */
    async findByEmail(dto: UserEmailInfoDto): Promise<User | null> {
        return await this.userRepository.findByEmail(dto.emailLocal, dto.emailDomain);
    }

    /**
     * 이메일로 유저를 가져옵니다.
     * 
     * 없으면 예외를 던집니다.
     */
    async findByEmailOrThrow(dto: UserEmailInfoDto): Promise<User> {
        const user = await this.findByEmail(dto);

        if (!user) {
            throw new UserIncorrectEmailException();
        }

        return user;
    }

    /**
     * id로 user를 가져옵니다.
     * 
     * 없으면 예외를 던집니다.
     */
    async findByIdOrThrow(id: number): Promise<User> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new UserNotFoundedException();
        }

        return user;
    }

    /**
     * ids로 user를 가져옵니다.
     */
    async findByIds(ids: number[]): Promise<User[]> {
        return await this.userRepository.findByIds(ids);
    }

    /**
     * user 엔티티를 받아서 그대로 저장합니다.
     */
    async saveByEntity(user: User): Promise<User> {
        return await this.userRepository.save(user);
    }
}