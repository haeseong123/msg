import { User } from "@app/msg-core/entities/user/user.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { UpdateResult } from "typeorm";
import { UserEmailConflictException } from "../../exceptions/user/user-email-conflict.exception";
import { UserSignupDto } from "../dto/user-signup.dto";
import { UserDto } from "../dto/user.dto";
import { UserRepository } from "../user.repository";
import { UserService } from "../user.service";

describe('UserService', () => {
    let userService: UserService;
    let userRepository: UserRepository;

    beforeEach(async () => {
        const repositoryMock = {
            findOneBy: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: UserRepository,
                    useValue: repositoryMock,
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
            const user: User = {
                id: 1,
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
            const findUserByEmailSpy = jest.spyOn(userService, 'findUserByEmail');
            const findOneBySpy = jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);

            // When
            const result = await userService.findUserByEmail(user.email);

            // Then
            expect(findUserByEmailSpy).toHaveBeenCalledWith(user.email);
            expect(findOneBySpy).toHaveBeenCalledWith({ email: user.email });
            expect(result).toBe(user);
        })
    });

    describe('id로_유저_가져오기', () => {
        it('성공', async () => {
            // Given
            const user: User = {
                id: 1,
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
            const findUserByIdSpy = jest.spyOn(userService, 'findUserById');
            const findOneBySpy = jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);

            // When
            const result = await userService.findUserById(user.id);

            // Then
            expect(findUserByIdSpy).toHaveBeenCalledWith(user.id);
            expect(findOneBySpy).toHaveBeenCalledWith({ id: user.id });
            expect(result).toBe(user);
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
            const findOneBySpy = jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);
            const toUserSpy = jest.spyOn(UserSignupDto, 'toUser').mockResolvedValue(dao);
            const saveRepositorySpy = jest.spyOn(userRepository, 'save').mockResolvedValue(savedUser);

            // When
            const result = await userService.save(dto);

            // Then
            expect(saveServiceSpy).toHaveBeenCalledWith(dto);
            expect(findOneBySpy).toHaveBeenCalledWith({ email: dto.email });
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
});