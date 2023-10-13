import { EmailInfo } from "@app/msg-core/entities/user/email-info";
import { UserRelationStatusEnum } from "@app/msg-core/entities/user/user-relation/user-relation-status.enum";
import { UserRelation } from "@app/msg-core/entities/user/user-relation/user-relation.entity";
import { User } from "@app/msg-core/entities/user/user.entity";
import { TestingModule, Test } from "@nestjs/testing";
import { UserRelationSaveDto } from "apps/msg/src/user/user-relation/dto/user-relation-save.dto";
import { UserRelationDto } from "apps/msg/src/user/user-relation/dto/user-relation.dto";
import { UserRelationService } from "apps/msg/src/user/user-relation/user-relation.service";
import { UserService } from "apps/msg/src/user/user.service";

describe('UserRelationService', () => {
    let userRelationService: UserRelationService;
    let userService: UserService;

    beforeEach(async () => {
        const userServiceMock = {
            findByIdOrThrow: jest.fn(),
            saveByEntity: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserRelationService,
                {
                    provide: UserService,
                    useValue: userServiceMock,
                },
            ]
        }).compile();

        userRelationService = module.get<UserRelationService>(UserRelationService);
        userService = module.get<UserService>(UserService);
    });

    describe('유저의 모든 관계를 가져옵니다.', () => {
        it('성공', async () => {
            // Given
            const relation = [];
            const user = User.of(EmailInfo.of('local', 'domain'), '', '', '', relation);

            jest.spyOn(userService, 'findByIdOrThrow').mockResolvedValue(user);

            // When
            const result = await userRelationService.findAllByUserId(1);

            // Then
            expect(result).toStrictEqual(relation);
        });
    });

    describe('관계를 생성합니다.', () => {
        let userRelationSaveDto: UserRelationSaveDto;
        let relation: UserRelation;
        let fromUser: User;
        let toUser: User;

        beforeEach(() => {
            const fromUserId = 2;
            const toUserId = 3;

            userRelationSaveDto = new UserRelationSaveDto(fromUserId, toUserId, UserRelationStatusEnum.FOLLOW);
            relation = userRelationSaveDto.toEntity();
            fromUser = User.of(EmailInfo.of('', ''), '', '', '', []);
            toUser = User.of(EmailInfo.of('', ''), '', '', '', []);
        });

        it('성공', async () => {
            // Given
            jest.spyOn(userService, 'findByIdOrThrow').mockResolvedValueOnce(fromUser);
            jest.spyOn(userService, 'findByIdOrThrow').mockResolvedValueOnce(toUser);
            jest.spyOn(userRelationSaveDto, 'toEntity').mockImplementation(() => relation);
            jest.spyOn(fromUser, 'createRelation').mockImplementation(() => { });
            jest.spyOn(userService, 'saveByEntity').mockResolvedValue(fromUser);
            jest.spyOn(fromUser, 'findRelationByToUserIdOrThrow').mockImplementation((_toUserId) => relation);

            // When
            const result = await userRelationService.save(userRelationSaveDto);

            // Then
            expect(result).toStrictEqual(relation);
        });
    });

    describe('관계의 status를 갱신합니다.', () => {
        it('성공', async () => {
            // Given
            const relationDto = new UserRelationDto(1, 2, 3, UserRelationStatusEnum.FOLLOW);
            const fromUser = User.of(EmailInfo.of('local', 'domain'), '', '', '', []);
            const toUser = User.of(EmailInfo.of('local', 'domain'), '', '', '', []);
            const relation = UserRelation.of(relationDto.fromUserId, relationDto.toUserId, relationDto.status);

            jest.spyOn(userService, 'findByIdOrThrow').mockResolvedValueOnce(fromUser);
            jest.spyOn(userService, 'findByIdOrThrow').mockResolvedValueOnce(toUser);
            jest.spyOn(fromUser, 'findRelationByToUserIdOrThrow').mockImplementation((_toUserId) => relation);
            jest.spyOn(fromUser, 'updateRelationStatus').mockImplementation(() => { });
            jest.spyOn(userService, 'saveByEntity').mockImplementation(async (_fromUser) => fromUser);

            // When
            const result = await userRelationService.update(relationDto);

            // Then
            expect(result).toStrictEqual(relation);
        });
    });
});