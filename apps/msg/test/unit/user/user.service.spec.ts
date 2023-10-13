import { EmailInfo } from "@app/msg-core/entities/user/email-info";
import { User } from "@app/msg-core/entities/user/user.entity";
import { TestingModule, Test } from "@nestjs/testing";
import { UserIncorrectEmailException } from "apps/msg/src/user/exception/user-incorrect-email.exception";
import { UserEmailInfoDto } from "apps/msg/src/user/dto/user-email-info.dto";
import { UserNotFoundedException } from "apps/msg/src/user/exception/user-not-found.exception";
import { UserRepository } from "apps/msg/src/user/user.repository";
import { UserService } from "apps/msg/src/user/user.service";

describe('UserService', () => {
    let userService: UserService;
    let userRepository: UserRepository;

    beforeEach(async () => {
        const userRepositoryMock = {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            findByIds: jest.fn(),
            save: jest.fn(),
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

    describe('이메일로 유저를 가져옵니다.', () => {
        it('성공', async () => {
            // Given
            const userEmailInfoDto = new UserEmailInfoDto('hs@naver.com');
            const user = User.of(EmailInfo.of(userEmailInfoDto.emailLocal, userEmailInfoDto.emailDomain), '', '', '', []);
            
            jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(user);

            // When
            const result = await userService.findByEmail(userEmailInfoDto);

            // Then
            expect(result).toEqual(user);
        });
    });

    describe('이메일로 유저를 가져옵니다. 없으면 예외를 던집니다.', () => {
        it('성공', async () => {
            // Given
            const userEmailInfoDto = new UserEmailInfoDto('hs@naver.com');
            const user = User.of(EmailInfo.of(userEmailInfoDto.emailLocal, userEmailInfoDto.emailDomain), '', '', '', []);
            
            jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(user);

            // When
            const result = await userService.findByEmailOrThrow(userEmailInfoDto);

            // Then
            expect(result).toEqual(user);
        });

        it('실패: dto에 해당되는 user가 존재하지 않음', async () => {
            // Given
            const userEmailInfoDto = new UserEmailInfoDto('hs@naver.com');
            
            jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);

            // When
            const resultPromise = userService.findByEmailOrThrow(userEmailInfoDto);

            // Then
            await expect(resultPromise).rejects.toThrow(UserIncorrectEmailException);
        });
    });

    describe('id로 user를 가져옵니다. 없으면 예외를 던집니다.', () => {
        it('성공', async () => {
            // Given
            const user = User.of(EmailInfo.of('local', 'domain'), '', '', '', []);
           
            jest.spyOn(userRepository, 'findById').mockResolvedValue(user);

            // When
            const result = await userService.findByIdOrThrow(1);

            // Then
            expect(result).toEqual(user);
        });

        it('실패: id에 해당되는 user가 존재하지 않음', async () => {
            // Given
            jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

            // When
            const resultPromise = userService.findByIdOrThrow(1);

            // Then
            await expect(resultPromise).rejects.toThrow(UserNotFoundedException);
        });
    });

    describe('ids로 user를 가져옵니다.', () => {
        it('성공', async () => {
            // Given
            const ids = [1, 2, 3];
            const users = [];

            jest.spyOn(userRepository, 'findByIds').mockResolvedValue(users);

            // When
            const result = await userService.findByIds(ids);

            // Then
            expect(result).toEqual(users);
        });
    });

    describe('user 엔티티를 받아서 그대로 저장합니다.', () => {
        it('성공', async () => {
            // Given
            const user = User.of(EmailInfo.of('local', 'domain'), '', '', '', []);
            
            jest.spyOn(userRepository, 'save').mockResolvedValue(user);

            // When
            const result = await userService.saveByEntity(user);

            // Then
            expect(result).toEqual(user);
        });
    });
});