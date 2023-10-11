import { UserRelationshipStatus } from "@app/msg-core/entities/user/user-relation/user-relation-status.enum";
import { UserRelationship } from "@app/msg-core/entities/user/user-relation/user-relation.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { MandatoryArgumentNullException } from "../../../src/common/exception/mandatory-argument-null.exception";
import { UserRelationshipDto } from "../../../src/user-relationship/dto/user-relationship.dto";
import { UserRelationshipFromIdUserIdMismatchException } from "../../../src/user-relationship/exceptions/user-relationship-from-id-user-id-mismatch.exception";
import { UserRelationshipIdParamMismatchException } from "../../../src/user-relationship/exceptions/user-relationship-id-param-mismatch.exception";
import { UserRelationshipController } from "../../../src/user-relationship/user-relationship.controller";
import { UserRelationshipService } from "../../../src/user-relationship/user-relationship.service";

describe('UserRelationshipController', () => {
    let userRelationshipController: UserRelationshipController;
    let userRelationshipService: UserRelationshipService;

    beforeEach(async () => {
        const serviceMock = {
            findAll: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        }
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserRelationshipController],
            providers: [
                {
                    provide: UserRelationshipService,
                    useValue: serviceMock
                }
            ],
        }).compile();

        userRelationshipController = module.get<UserRelationshipController>(UserRelationshipController);
        userRelationshipService = module.get<UserRelationshipService>(UserRelationshipService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('유저_관계_전부_가져오기', () => {
        it('성공', async () => {
            // Given
            const userId: number = 0;

            const findControllerSpy = jest.spyOn(userRelationshipController, 'findAll');
            const findServiceSpy = jest.spyOn(userRelationshipService, 'findAll').mockResolvedValue([]);

            // When
            const result = await userRelationshipController.findAll(userId);

            // Then
            expect(findControllerSpy).toHaveBeenCalledWith(userId);
            expect(findServiceSpy).toHaveBeenCalledWith(userId);
            expect(result).toStrictEqual([]);
        });
    });

    describe('유저_관계_생성', () => {
        const relationshipId = 10;
        const fromUserId = 1;
        const toUserId = 2;
        const status = UserRelationshipStatus.FOLLOW

        it('성공', async () => {
            // Given
            // const userId: number = 1;
            const dto = new UserRelationshipDto(
                undefined,
                fromUserId,
                toUserId,
                status
            );
            const relationship = new UserRelationship(
                dto.fromUserId,
                dto.toUserId,
                dto.status
            );
            relationship.id = relationshipId;
            const userRelationshipDto = new UserRelationshipDto(
                relationshipId,
                relationship.fromUserId,
                relationship.toUserId,
                relationship.status
            )

            const saveControllerSpy = jest.spyOn(userRelationshipController, 'save');
            const saveServiceSpy = jest.spyOn(userRelationshipService, 'save').mockResolvedValue(relationship);

            // When
            const result = await userRelationshipController.save(fromUserId, dto);

            // Then
            expect(saveControllerSpy).toHaveBeenCalledWith(fromUserId, dto);
            expect(saveServiceSpy).toHaveBeenCalledWith(dto);
            expect(result).toStrictEqual(userRelationshipDto);
        });

        it('실패_userId와_fromUserId가_다름', async () => {
            // Given
            const someOtherFromUserId = 111;
            const dto = new UserRelationshipDto(
                undefined, // fromUserId와 userId가 같아야 됨
                someOtherFromUserId,
                toUserId,
                status
            );

            const saveControllerSpy = jest.spyOn(userRelationshipController, 'save');

            // When
            const resultPromise = userRelationshipController.save(fromUserId, dto);

            // Then
            await expect(resultPromise).rejects.toThrow(UserRelationshipFromIdUserIdMismatchException);
            expect(saveControllerSpy).toHaveBeenCalledWith(fromUserId, dto);
        });
    });

    describe('유저_관계_업데이트', () => {
        const fromUserId: number = 1;
        const toUserId: number = 2;
        const status = UserRelationshipStatus.BLOCK;
        const relationshipId = 10;

        it('성공', async () => {
            // Given
            const dto = new UserRelationshipDto(
                relationshipId,
                fromUserId,
                toUserId,
                status
            );

            const updateControllerSpy = jest.spyOn(userRelationshipController, 'update');
            const updateServiceSpy = jest.spyOn(userRelationshipService, 'update');

            // When
            const result = await userRelationshipController.update(fromUserId, relationshipId, dto);

            // Then
            expect(updateControllerSpy).toHaveBeenCalledWith(fromUserId, relationshipId, dto);
            expect(updateServiceSpy).toHaveBeenCalledWith(dto);
            expect(result).toBeUndefined();
        });

        it('실패_dto.id가_비어있음', async () => {
            // Given
            const dto = new UserRelationshipDto(
                undefined,
                fromUserId,
                toUserId,
                status
            );

            const updateControllerSpy = jest.spyOn(userRelationshipController, 'update');

            // When
            const result = userRelationshipController.update(fromUserId, relationshipId, dto);

            // Then
            await expect(result).rejects.toThrow(MandatoryArgumentNullException);
            expect(updateControllerSpy).toHaveBeenCalledWith(fromUserId, relationshipId, dto);
        });

        it('실패_userId와_fromUserId가_다름', async () => {
            // Given
            const otherUserId = 123456;
            const dto = new UserRelationshipDto(
                relationshipId,
                otherUserId, // fromUserId와 usb가 같아야 됨
                toUserId,
                UserRelationshipStatus.BLOCK
            );
            const updateControllerSpy = jest.spyOn(userRelationshipController, 'update');

            // When
            const result = userRelationshipController.update(fromUserId, relationshipId, dto);

            // Then
            await expect(result).rejects.toThrow(UserRelationshipFromIdUserIdMismatchException);
            expect(updateControllerSpy).toHaveBeenCalledWith(fromUserId, relationshipId, dto);
        });

        it('실패_relationShipId와_dto.id가_다름', async () => {
            // Given
            const someOtherDtoId = 999
            const dto = new UserRelationshipDto(
                someOtherDtoId,// 파라미터로 보내는 relationShipId와 이 dto.id가 일치해야 함.
                fromUserId,
                toUserId,
                status
            );
            const updateControllerSpy = jest.spyOn(userRelationshipController, 'update');

            // When
            const result = userRelationshipController.update(fromUserId, relationshipId, dto);

            // Then
            await expect(result).rejects.toThrow(UserRelationshipIdParamMismatchException);
            expect(updateControllerSpy).toHaveBeenCalledWith(fromUserId, relationshipId, dto);
        });

    });

    describe('유저_관계_삭제하기', () => {
        it('성공', async () => {
            // Given
            const userId = 1;
            const relationshipId = 10;

            const deleteControllerSpy = jest.spyOn(userRelationshipController, 'delete');
            const deleteServiceSpy = jest.spyOn(userRelationshipService, 'delete');

            // When
            const result = await userRelationshipController.delete(userId, relationshipId);

            // Then
            expect(deleteControllerSpy).toHaveBeenCalledWith(userId, relationshipId);
            expect(deleteServiceSpy).toHaveBeenCalledWith(relationshipId, userId);
            expect(result).toBeUndefined();
        });
    });
});