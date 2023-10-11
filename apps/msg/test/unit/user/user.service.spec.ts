import { User } from "@app/msg-core/entities/user/user.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { In, UpdateResult } from "typeorm";
import { UserRepository } from "../../../src/user/user.repository";
import { UserService } from "../../../src/user/user.service";

describe('UserService', () => {
    let userService: UserService;
    let userRepository: UserRepository;

    beforeEach(async () => {
        const userRepositoryMock = {
            findOneByEmail: jest.fn(),
            findOneById: jest.fn(),
            findByIds: jest.fn(),
            findWithRelationshipById: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: UserRepository,
                    useValue: userRepositoryMock,
                }
            ]
        }).compile();

        userService = module.get<UserService>(UserService);
        userRepository = module.get<UserRepository>(UserRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    describe('이메일로_유저_가져오기', () => {
        it('성공', async () => {
            // Given
            const userEmail = 'a@na.com';
            const user: User = new User(
                userEmail,
                '123',
                'test_address',
                'hs'
            );

            const findUserByEmailSpy = jest.spyOn(userService, 'findUserByEmail');
            const findOneBySpy = jest.spyOn(userRepository, 'findOneByEmail').mockResolvedValue(user);

            // When
            const result = await userService.findUserByEmail(userEmail);

            // Then
            expect(findUserByEmailSpy).toHaveBeenCalledWith(userEmail);
            expect(findOneBySpy).toHaveBeenCalledWith(userEmail);
            expect(result).toEqual(user);
        })
    });

    describe('id로_유저_가져오기', () => {
        it('성공', async () => {
            // Given
            const userId = 1;
            const user: User = new User(
                'a@n.com',
                '123',
                'add',
                'nick'
            );

            const findUserByIdSpy = jest.spyOn(userService, 'findUserById');
            const findOneBySpy = jest.spyOn(userRepository, 'findOneById').mockResolvedValue(user);

            // When
            const result = await userService.findUserById(userId);

            // Then
            expect(findUserByIdSpy).toHaveBeenCalledWith(userId);
            expect(findOneBySpy).toHaveBeenCalledWith(userId);
            expect(result).toEqual(user);
        })
    });

    describe('유저_저장', () => {
        it('성공', async () => {
            // Given
            const user = new User(
                'a@c.com',
                'password',
                'add',
                'nick'
            );
            const savedUser: User = new User(
                user.email,
                user.password,
                user.address,
                user.nickname
            )
            savedUser.id = 1;

            const saveServiceSpy = jest.spyOn(userService, 'save');
            const saveRepositorySpy = jest.spyOn(userRepository, 'save').mockResolvedValue(savedUser);

            // When
            const result = await userService.save(user);

            // Then
            expect(saveServiceSpy).toHaveBeenCalledWith(user);
            expect(saveRepositorySpy).toHaveBeenCalledWith(user);
            expect(result).toEqual(savedUser);
        });
    });

    describe('유저_업데이트', () => {
        it('성공', async () => {
            // Given
            const userId = 1;
            const partialUser: Partial<User> = {
                address: 'new_address'
            };

            const updateSpy = jest.spyOn(userService, 'update');
            const updateRepositorySpy = jest.spyOn(userRepository, 'update');

            // When
            const result = await userService.update(userId, partialUser);

            // Then
            expect(updateSpy).toHaveBeenCalledWith(userId, partialUser);
            expect(updateRepositorySpy).toHaveBeenCalledWith(userId, partialUser);
            expect(result).toBeUndefined();
        });
    });

    describe('userIds로_여러_유저_찾기', () => {
        it('성공', async () => {
            // Given
            const userIds = [1, 2];
            const users: User[] = [
                new User(
                    "ab@na.com",
                    '111',
                    'add1',
                    'nick1'
                ),
                new User(
                    "abcde@na.com",
                    '222',
                    'add2',
                    'nick2'
                ),
            ]

            const findUserByIdsSpy = jest.spyOn(userService, 'findUserByIds');
            const findBySpy = jest.spyOn(userRepository, 'findByIds').mockResolvedValue(users);

            // When
            const result = await userService.findUserByIds(userIds);

            // Then
            expect(findUserByIdsSpy).toHaveBeenCalledWith(userIds);
            expect(findBySpy).toHaveBeenCalledWith(userIds);
            expect(result).toStrictEqual(users);
        });
    });

    describe('유저_id로_관계까지_가져오기', () => {
        it('성공', async () => {
            // Given
            const userId: number = 1;
            const foundedUser: User = new User(
                'email@d.com',
                '123',
                'add',
                'nick'
            );
            const userServicefindUserWithRelationshipByIdSpy = jest.spyOn(userService, 'findUserWithRelationshipById');
            const userRepositoryfindUserWithRelationshipByIdSpy = jest.spyOn(userRepository, 'findWithRelationshipById').mockResolvedValue(foundedUser);

            // When
            const result = await userService.findUserWithRelationshipById(userId);

            // Then
            expect(userServicefindUserWithRelationshipByIdSpy).toHaveBeenCalledWith(userId);
            expect(userRepositoryfindUserWithRelationshipByIdSpy).toHaveBeenCalledWith(userId);
            expect(result).toStrictEqual(foundedUser);
        })
    });
});