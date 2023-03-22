import { UserRelationshipStatus } from "@app/msg-core/entities/user-relationship/user-relationship-status";
import { UserRelationship } from "@app/msg-core/entities/user-relationship/user-relationship.entity";
import { User } from "@app/msg-core/entities/user/user.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { In, UpdateResult } from "typeorm";
import { UserEmailConflictException } from "../../auth/exceptions/user-email-conflict.exception";
import { RelationshipDto } from "../dto/relationship.dto";
import { UserSignupDto } from "../dto/user-signup.dto";
import { UserWithRelationshipDto } from "../dto/user-with-relationship.dto";
import { UserDto } from "../dto/user.dto";
import { UserRepository } from "../user.repository";
import { UserService } from "../user.service";

describe('UserService', () => {
    let userService: UserService;
    let userRepository: UserRepository;

    beforeEach(async () => {
        const userRepositoryMock = {
            findOneBy: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            findBy: jest.fn(),
            findUserWithRelationship: jest.fn(),
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
            const user: User = {
                id: 1,
                email: userEmail,
                password: 'password123',
                address: 'test_address',
                nickname: 'hs',
                refreshToken: null,
                userChatRooms: [],
                sentMessages: [],
                relationshipFromMe: [],
                relationshipToMe: [],
                notifications: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }
            const resultDto: UserDto = {
                id: user.id,
                email: user.email,
                address: user.address,
                nickname: user.nickname,
            }
            const findUserByEmailSpy = jest.spyOn(userService, 'findUserByEmail');
            const findOneBySpy = jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);

            // When
            const result = await userService.findUserByEmail(userEmail);

            // Then
            expect(findUserByEmailSpy).toHaveBeenCalledWith(userEmail);
            expect(findOneBySpy).toHaveBeenCalledWith({ email: userEmail });
            expect(result).toEqual(resultDto);
        })
    });

    describe('이메일로_유저_엔티티_가져오기', () => {
        it('성공', async () => {
            // Given
            const userEmail = 'a@na.com';
            const user: User = {
                id: 1,
                email: userEmail,
                password: 'password123',
                address: 'test_address',
                nickname: 'hs',
                refreshToken: null,
                userChatRooms: [],
                sentMessages: [],
                relationshipFromMe: [],
                relationshipToMe: [],
                notifications: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }
            // const resultDto: UserDto = {
            //     id: user.id,
            //     email: user.email,
            //     address: user.address,
            //     nickname: user.nickname,
            // }
            const findUserEntityByEmailSpy = jest.spyOn(userService, 'findUserEntityByEmail');
            const findOneBySpy = jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);

            // When
            const result = await userService.findUserEntityByEmail(userEmail);

            // Then
            expect(findUserEntityByEmailSpy).toHaveBeenCalledWith(userEmail);
            expect(findOneBySpy).toHaveBeenCalledWith({ email: userEmail });
            expect(result).toEqual(user);
        })
    });

    describe('id로_유저_가져오기', () => {
        it('성공', async () => {
            // Given
            const userId = 1;
            const user: User = {
                id: userId,
                email: "a@na.com",
                password: 'password123',
                address: 'test_address',
                nickname: 'hs',
                refreshToken: null,
                userChatRooms: [],
                sentMessages: [],
                relationshipFromMe: [],
                relationshipToMe: [],
                notifications: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }
            const resultDto: UserDto = {
                id: user.id,
                email: user.email,
                address: user.address,
                nickname: user.nickname,
            }
            const findUserByIdSpy = jest.spyOn(userService, 'findUserById');
            const findOneBySpy = jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);

            // When
            const result = await userService.findUserById(userId);

            // Then
            expect(findUserByIdSpy).toHaveBeenCalledWith(userId);
            expect(findOneBySpy).toHaveBeenCalledWith({ id: userId });
            expect(result).toEqual(resultDto);
        })
    });

    describe('id로_유저_엔티티_가져오기', () => {
        it('성공', async () => {
            // Given
            const userId = 1;
            const user: User = {
                id: userId,
                email: "a@na.com",
                password: 'password123',
                address: 'test_address',
                nickname: 'hs',
                refreshToken: null,
                userChatRooms: [],
                sentMessages: [],
                relationshipFromMe: [],
                relationshipToMe: [],
                notifications: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }
            const findUserEntityByIdSpy = jest.spyOn(userService, 'findUserEntityById');
            const findOneBySpy = jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);

            // When
            const result = await userService.findUserEntityById(userId);

            // Then
            expect(findUserEntityByIdSpy).toHaveBeenCalledWith(userId);
            expect(findOneBySpy).toHaveBeenCalledWith({ id: userId });
            expect(result).toEqual(user);
        })
    });

    describe('유저_저장하기', () => {
        const dto: UserSignupDto = {
            email: "test@asd.com",
            password: "123123",
            address: "address",
            nickname: "nickname",
        };

        it('성공', async () => {
            // Given
            const dao = new User(
                dto.email,
                dto.password,
                dto.address,
                dto.nickname,
            );
            const savedUser: User = {
                id: 1,
                ...dao,
                refreshToken: null,
                userChatRooms: [],
                sentMessages: [],
                relationshipFromMe: [],
                relationshipToMe: [],
                notifications: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const resultDto: UserDto = {
                id: savedUser.id,
                email: savedUser.email,
                address: savedUser.address,
                nickname: savedUser.nickname,
            };
            const saveServiceSpy = jest.spyOn(userService, 'save');
            const findUserByEmailSpy = jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
            const toUserSpy = jest.spyOn(UserSignupDto, 'toUser').mockResolvedValue(dao);
            const saveRepositorySpy = jest.spyOn(userRepository, 'save').mockResolvedValue(savedUser);

            // When
            const result = await userService.save(dto);

            // Then
            expect(saveServiceSpy).toHaveBeenCalledWith(dto);
            expect(findUserByEmailSpy).toHaveBeenCalledWith(dto.email);
            expect(toUserSpy).toHaveBeenCalledWith(dto);
            expect(saveRepositorySpy).toHaveBeenCalledWith(dao);
            expect(result).toEqual(resultDto);
        });

        it('실패_이미_존재하는_이메일', async () => {
            // Given
            const alreadyExistingUser: User = {
                id: 1,
                email: dto.email,
                password: dto.password,
                address: dto.address,
                nickname: dto.nickname,
                refreshToken: null,
                userChatRooms: [],
                sentMessages: [],
                relationshipFromMe: [],
                relationshipToMe: [],
                notifications: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }
            const saveServiceSpy = jest.spyOn(userService, 'save');
            const findOneBySpy = jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(alreadyExistingUser);

            // When
            const resultPromise = userService.save(dto);

            // Then
            await expect(resultPromise).rejects.toThrow(UserEmailConflictException);
            expect(saveServiceSpy).toHaveBeenCalledWith(dto);
            expect(findOneBySpy).toHaveBeenCalledWith({ email: dto.email });
        });
    });

    describe('유저_업데이트_하기', () => {
        it('성공', async () => {
            // Given
            const userId = 1;
            const partialUser: Partial<User> = {
                address: 'new_address'
            };
            const updateResult: UpdateResult = {
                raw: 'abc',
                affected: 1,
                generatedMaps: []
            };
            const updateSpy = jest.spyOn(userService, 'update');
            const updateRepositorySpy = jest.spyOn(userRepository, 'update').mockResolvedValue(updateResult);

            // When
            const result = await userService.update(userId, partialUser);

            // Then
            expect(updateSpy).toHaveBeenCalledWith(userId, partialUser);
            expect(updateRepositorySpy).toHaveBeenCalledWith(userId, partialUser);
            expect(result).toBe(partialUser);
        });
    });

    describe('userIds로_여러_유저_찾기', () => {
        it('성공', async () => {
            // Given
            const userId1 = 1;
            const userId2 = 2;
            const userIds = [userId1, userId2];
            const users: User[] = [
                {
                    id: userId1,
                    email: "a@na.com",
                    password: 'password123',
                    address: 'test_address',
                    nickname: 'hs',
                    refreshToken: null,
                    userChatRooms: [],
                    sentMessages: [],
                    relationshipFromMe: [],
                    relationshipToMe: [],
                    notifications: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: userId2,
                    email: "2a@na.com",
                    password: '2password123',
                    address: '2test_address',
                    nickname: '2hs',
                    refreshToken: null,
                    userChatRooms: [],
                    sentMessages: [],
                    relationshipFromMe: [],
                    relationshipToMe: [],
                    notifications: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]
            const resultDtos: UserDto[] = [
                new UserDto(users[0].id, users[0].email, users[0].address, users[0].nickname),
                new UserDto(users[1].id, users[1].email, users[1].address, users[1].nickname),
            ]

            const findUserByIdsSpy = jest.spyOn(userService, 'findUserByIds');
            const findBySpy = jest.spyOn(userRepository, 'findBy').mockResolvedValue(users);

            // When
            const result = await userService.findUserByIds(userIds);

            // Then
            expect(findUserByIdsSpy).toHaveBeenCalledWith(userIds);
            expect(findBySpy).toHaveBeenCalledWith({ id: In(userIds) });
            expect(result).toStrictEqual(resultDtos);
        });
    });

    describe('유저_업데이트_하기', () => {
        it('성공', async () => {
            // Given
            const userId = 1;
            const followId = 2;
            const followerId = 2;
            const follow: User = new User('follow@a.com', 'pass', 'add', 'nick')
            const follower: User = new User('er@a.com', 'er_pass', 'er_add', 'er_nick')
            const fromMe: UserRelationship = new UserRelationship(
                userId,
                followId,
                UserRelationshipStatus.FOLLOW,
            );
            const toMe: UserRelationship = new UserRelationship(
                followerId,
                userId,
                UserRelationshipStatus.FOLLOW,
            );
            follow.id = followId;
            follower.id = followerId;
            fromMe.toUser = follow;
            toMe.fromUser = follower;
            const user: User = {
                id: userId,
                email: "email",
                password: "password",
                address: "address",
                nickname: "nickname",
                refreshToken: "refreshToken",
                userChatRooms: [],
                sentMessages: [],
                relationshipFromMe: [fromMe],
                relationshipToMe: [toMe],
                notifications: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }
            const resultDto: UserWithRelationshipDto = new UserWithRelationshipDto(
                user.id,
                user.email,
                user.address,
                user.nickname,
                [
                    new RelationshipDto(
                        user.relationshipFromMe[0].id,
                        user.relationshipFromMe[0].fromUserId,
                        user.relationshipFromMe[0].toUserId,
                        user.relationshipFromMe[0].status,
                        null,
                        user.relationshipFromMe[0].toUser
                    )
                ],
                [
                    new RelationshipDto(
                        user.relationshipToMe[0].id,
                        user.relationshipToMe[0].fromUserId,
                        user.relationshipToMe[0].toUserId,
                        user.relationshipToMe[0].status,
                        user.relationshipToMe[0].fromUser,
                        null
                    )
                ],
            )

            const userServiceFindUserWithRelationshipSpy = jest.spyOn(userService, 'findUserWithRelationship');
            const userRepositoryfindUserWithRelationshipSpy = jest.spyOn(userRepository, 'findUserWithRelationship').mockResolvedValue(user);

            // When
            const result = await userService.findUserWithRelationship(userId);

            // Then
            expect(userServiceFindUserWithRelationshipSpy).toHaveBeenCalledWith(userId);
            expect(userRepositoryfindUserWithRelationshipSpy).toHaveBeenCalledWith(userId);
            expect(result).toStrictEqual(resultDto)
        });
    });
});