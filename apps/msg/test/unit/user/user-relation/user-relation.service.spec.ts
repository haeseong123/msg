import { EmailInfo } from "@app/msg-core/entities/user/email-info";
import { UserRelationStatusEnum } from "@app/msg-core/entities/user/user-relation/user-relation-status.enum";
import { UserRelation } from "@app/msg-core/entities/user/user-relation/user-relation.entity";
import { User } from "@app/msg-core/entities/user/user.entity";
import { TestingModule, Test } from "@nestjs/testing";
import { ArgumentInvalidException } from "apps/msg/src/common/exception/argument-invalid.exception";
import { UserRelationDto } from "apps/msg/src/user/user-relation/dto/user-relation.dto";
import { UserNotFoundedException } from "apps/msg/src/user/user-relation/exceptions/user-not-found.exception";
import { UserRelationService } from "apps/msg/src/user/user-relation/user-relation.service";
import { UserService } from "apps/msg/src/user/user.service";

describe('UserRelationService', () => {
    let userRelationService: UserRelationService;
    let userService: UserService;

    beforeEach(async () => {
        const userServiceMock = {
            findByIdOrThrow: jest.fn(),
            save: jest.fn(),
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

    describe('userId를 사용하여 해당 유저의 관계 전부 가져오기', () => {
        it('성공', async () => {
            // Given
            const userId = 1;
            const relation = [];
            const user = User.of(EmailInfo.of('local', 'domain'), '', '', '', relation);
            jest.spyOn(userService, 'findByIdOrThrow').mockResolvedValue(user);

            // When
            const result = await userRelationService.findAllByUserId(userId);

            // Then
            expect(result).toStrictEqual(relation);
        });
    });

    /**
     * 성공: 관계 갱신
     * 성공: 관계 생성
     * 
     * 실패: 자기 자신을 관계에 추가할 순 없습니다.
     * 실패: dto.frumUserId 혹은 dto.toUserId에 해당되는 user가 존재하지 않습니다.
     */
    describe('관계 생성하기', () => {
        let userRelationDto: UserRelationDto;
        let relation: UserRelation;
        let fromUser: User;
        let toUser: User;

        beforeEach(() => {
            const fromUserId = 2;
            const toUserId = 3;

            userRelationDto = new UserRelationDto(1, fromUserId, toUserId, UserRelationStatusEnum.FOLLOW);
            relation = userRelationDto.toEntity();
            fromUser = User.of(EmailInfo.of('', ''), '', '', '', []);
            toUser = User.of(EmailInfo.of('', ''), '', '', '', []);
        });

        it('성공: 관계 갱신', async () => {
            // Given
            const hasRelationAlreadyFromUser = User.of(EmailInfo.of('', ''), '', '', '', [relation]);
            jest.spyOn(userService, 'findByIdOrThrow').mockResolvedValueOnce(hasRelationAlreadyFromUser);
            jest.spyOn(userService, 'findByIdOrThrow').mockResolvedValueOnce(toUser);
            const relationUpdateSpy = jest.spyOn(hasRelationAlreadyFromUser, 'updateRelationStatus');

            // When
            const result = await userRelationService.save(userRelationDto);

            // Then
            expect(relationUpdateSpy).toHaveBeenCalledWith(relation);
            expect(result).toStrictEqual(relation);
        });

        it('성공: 관계 생성', async () => {
            // Given
            jest.spyOn(userService, 'findByIdOrThrow').mockResolvedValueOnce(fromUser);
            jest.spyOn(userService, 'findByIdOrThrow').mockResolvedValueOnce(toUser);
            const relationCreateSpy = jest.spyOn(fromUser, 'createRelation');

            // When
            const result = await userRelationService.save(userRelationDto);

            // Then
            expect(relationCreateSpy).toHaveBeenCalledWith(relation);
            expect(result).toStrictEqual(relation);
        });

        it('실패: 자기 자신을 관계에 추가할 순 없습니다.', async () => {
            // Given
            const fromUserEqualToUserDto = new UserRelationDto(1, 2, 2, UserRelationStatusEnum.BLOCK);
            jest.spyOn(userService, 'findByIdOrThrow').mockResolvedValueOnce(fromUser);
            jest.spyOn(userService, 'findByIdOrThrow').mockResolvedValueOnce(toUser);

            // When
            const resultPromise = userRelationService.save(fromUserEqualToUserDto);

            // Then
            await expect(resultPromise).rejects.toThrow(ArgumentInvalidException);
        });
    });
});