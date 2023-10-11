import { EmailInfo } from "@app/msg-core/entities/user/email-info";
import { User } from "@app/msg-core/entities/user/user.entity";
import { TestingModule, Test } from "@nestjs/testing";
import { UserEmailInfoDto } from "apps/msg/src/user/dto/user-email-info.dto";
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

    describe('이메일로 유저 가져오기', () => {
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

    describe('id로 유저 가져오기', () => {
        it('성공', async () => {
            // Given
            const id = 1;
            const user = User.of(EmailInfo.of('local', 'domain'), '', '', '', []);
            jest.spyOn(userRepository, 'findById').mockResolvedValue(user);

            // When
            const result = await userService.findById(id);

            // Then
            expect(result).toEqual(user);
        });
    });

    describe('ids로 유저 가져오기', () => {
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

    describe('유저 저장', () => {
        it('성공', async () => {
            // Given
            const user = User.of(EmailInfo.of('local', 'domain'), '', '', '', []);
            jest.spyOn(userRepository, 'save').mockResolvedValue(user);

            // When
            const result = await userService.save(user);

            // Then
            expect(result).toEqual(user);
        });
    });
});