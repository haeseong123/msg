import { User } from '@app/msg-core/entities/user/user.entity';
import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { ArgumentInvalidException } from '../exceptions/argument/argument-invalid.exception';
import { UserEmailConflictException } from '../exceptions/user/user-email-conflict.exception';
import { RelationshipDto } from './dto/relationship.dto';
import { UserSignupDto } from './dto/user-signup.dto';
import { UserWithRelationshipDto } from './dto/user-with-relationship.dto';
import { UserDto } from './dto/user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
    constructor(private userRepository: UserRepository) { }

    async findUserByEmail(email: string): Promise<UserDto | undefined> {
        const result = await this.userRepository.findOneBy({ email });
        const resultDto = new UserDto(result.id, result.email, result.address, result.nickname);
        return resultDto;
    }

    async findUserEntityByEmail(email: string): Promise<User | undefined> {
        return await this.userRepository.findOneBy({ email });
    }

    async findUserById(id: number): Promise<UserDto | undefined> {
        const result = await this.userRepository.findOneBy({ id });
        const resultDto = new UserDto(result.id, result.email, result.address, result.nickname);
        return resultDto;
    }

    async findUserEntityById(id: number): Promise<User | undefined> {
        return await this.userRepository.findOneBy({ id });
    }

    async save(dto: UserSignupDto): Promise<UserDto> {
        if (await this.findUserByEmail(dto.email)) {
            throw new UserEmailConflictException();
        }

        const result = await this.userRepository.save(await UserSignupDto.toUser(dto));
        const resultDto = new UserDto(result.id, result.email, result.address, result.nickname);
        return resultDto;
    }

    async update(id: number, data: Partial<User>): Promise<Partial<User>> {
        await this.userRepository.update(id, data);

        return data;
    }

    async findUserByIds(userIds: number[]): Promise<UserDto[]> {
        const users = await this.userRepository.findBy({ id: In(userIds) });
        const resultDtos = users.map(user =>
            new UserDto(user.id, user.email, user.address, user.nickname)
        );
        return resultDtos;
    }

    async findUserWithRelationship(userId: number): Promise<UserWithRelationshipDto | undefined> {
        const user = await this.userRepository.findUserWithRelationship(userId);

        if (!user) {
            throw new ArgumentInvalidException();
        }

        const resultDto = new UserWithRelationshipDto(
            user.id,
            user.email,
            user.address,
            user.nickname,
            user.relationshipFromMe.map(
                rfm => new RelationshipDto(
                    rfm.id,
                    rfm.fromUserId,
                    rfm.toUserId,
                    rfm.status,
                    null,
                    rfm.toUser
                )
            ),
            user.relationshipToMe.map(
                rfm => new RelationshipDto(
                    rfm.id,
                    rfm.fromUserId,
                    rfm.toUserId,
                    rfm.status,
                    rfm.fromUser,
                    null
                )
            ),
        );
        return resultDto;
    }
}
