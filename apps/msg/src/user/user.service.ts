import { User } from '@app/msg-core/entities/user/user.entity';
import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
    constructor(private userRepository: UserRepository) { }

    async findUserByEmail(email: string): Promise<User | undefined> {
        return await this.userRepository.findOneByEmail(email);
    }

    async findUserById(id: number): Promise<User | undefined> {
        return await this.userRepository.findOneById(id);
    }

    async save(user: User): Promise<User> {
        return await this.userRepository.save(user);
    }

    async update(id: number, data: Partial<User>): Promise<void> {
        return await this.userRepository.update(id, data);
    }

    async findUserByIds(ids: number[]): Promise<User[]> {
        return await this.userRepository.findByIds(ids);
    }

    async findUserWithRelationshipById(userId: number): Promise<User | undefined> {
        return await this.userRepository.findUserWithRelationshipById(userId);
    }
}
