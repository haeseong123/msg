import { UserRelationshipStatus } from "@app/msg-core/entities/user-relationship/user-relationship-status";
import { UserRelationship } from "@app/msg-core/entities/user-relationship/user-relationship.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { MandatoryArgumentNullException } from "../../exceptions/mandatory-argument-null.exception";
import { UserRelationshipDto } from "../dto/user-relationship.dto";
import { UserRelationshipIdParamMismatchException } from "../exceptions/user-relationship-id-param-mismatch.exception";
import { UserRelationshipIdTokenIdMismatchException } from "../exceptions/user-relationship-id-token-id-mismatch.exception";
import { UserRelationshipController } from "../user-relationship.controller";
import { UserRelationshipService } from "../user-relationship.service";

describe('UserRelationshipController', () => {
    let userRelationshipController: UserRelationshipController;
    let userRelationshipService: UserRelationshipService;

    beforeEach(async () => {
        const serviceMock = {
            findAll: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
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
            const sub: number = 0;

            const findControllerSpy = jest.spyOn(userRelationshipController, 'findAll');
            const findServiceSpy = jest.spyOn(userRelationshipService, 'findAll').mockResolvedValue([]);

            // When
            const result = await userRelationshipController.findAll(sub);

            // Then
            expect(findControllerSpy).toHaveBeenCalledWith(sub);
            expect(findServiceSpy).toHaveBeenCalledWith(sub);
            expect(result).toStrictEqual([]);
        });
    });

    describe('유저_관계_생성', () => {
        it('성공', async () => {
            // Given
            const sub: number = 1;
            const dto: UserRelationshipDto = {
                fromUserId: sub,
                toUserId: 1,
                status: UserRelationshipStatus.FOLLOW
            };
            const relationship: UserRelationship = new UserRelationship(
                dto.fromUserId,
                dto.toUserId,
                dto.status
            );
            relationship.id = 10;
            const userRelationshipDto: UserRelationshipDto = UserRelationshipDto.of(
                relationship.id,
                relationship.fromUserId,
                relationship.toUserId,
                relationship.status
            )

            const saveControllerSpy = jest.spyOn(userRelationshipController, 'save');
            const saveServiceSpy = jest.spyOn(userRelationshipService, 'save').mockResolvedValue(relationship);

            // When
            const result = await userRelationshipController.save(sub, dto);

            // Then
            expect(saveControllerSpy).toHaveBeenCalledWith(sub, dto);
            expect(saveServiceSpy).toHaveBeenCalledWith(dto);
            expect(result).toStrictEqual(userRelationshipDto);
        });

        it('실패_sub와_fromUserId가_다름', async () => {
            // Given
            const sub = 0;
            const dto: UserRelationshipDto = {
                fromUserId: 1, // fromUserId와 sub가 같아야 됨
                toUserId: 2,
                status: UserRelationshipStatus.FOLLOW
            };

            const saveControllerSpy = jest.spyOn(userRelationshipController, 'save');

            // When
            const resultPromise = userRelationshipController.save(sub, dto);

            // Then
            await expect(resultPromise).rejects.toThrow(UserRelationshipIdTokenIdMismatchException);
            expect(saveControllerSpy).toHaveBeenCalledWith(sub, dto);
        });
    });

    describe('유저_관계_업데이트', () => {
        it('성공', async () => {
            // Given
            const sub: number = 0;
            const paramId = 1;
            const dto: UserRelationshipDto = {
                id: paramId,
                fromUserId: sub,
                toUserId: 2,
                status: UserRelationshipStatus.BLOCK
            };

            const updateControllerSpy = jest.spyOn(userRelationshipController, 'update');
            const updateServiceSpy = jest.spyOn(userRelationshipService, 'update');

            // When
            const result = await userRelationshipController.update(sub, paramId, dto);

            // Then
            expect(updateControllerSpy).toHaveBeenCalledWith(sub, paramId, dto);
            expect(updateServiceSpy).toHaveBeenCalledWith(dto);
            expect(result).toBe(undefined);
        });

        it('실패_dto.id가_비어있음', async () => {
            // Given
            const sub: number = 0;
            const paramId = 1;
            const userRelationshipDto: UserRelationshipDto = {
                id: null,
                fromUserId: sub,
                toUserId: 3,
                status: UserRelationshipStatus.BLOCK
            };
            const updateControllerSpy = jest.spyOn(userRelationshipController, 'update');

            // When
            const result = userRelationshipController.update(sub, paramId, userRelationshipDto);

            // Then
            await expect(result).rejects.toThrow(MandatoryArgumentNullException);
            expect(updateControllerSpy).toHaveBeenCalledWith(sub, paramId, userRelationshipDto);
        });

        it('실패_sub와_fromUserId가_다름', async () => {
            // Given
            const sub: number = 0;
            const paramId = 1;
            const userRelationshipDto: UserRelationshipDto = {
                id: paramId,
                fromUserId: 23456, // fromUserId와 usb가 같아야 됨
                toUserId: 3,
                status: UserRelationshipStatus.BLOCK
            };
            const updateControllerSpy = jest.spyOn(userRelationshipController, 'update');

            // When
            const result = userRelationshipController.update(sub, paramId, userRelationshipDto);

            // Then
            await expect(result).rejects.toThrow(UserRelationshipIdTokenIdMismatchException);
            expect(updateControllerSpy).toHaveBeenCalledWith(sub, paramId, userRelationshipDto);
        });

        it('실패_paramId와_dto.id가_다름', async () => {
            // Given
            const sub: number = 0;
            const paramId = 1;
            const userRelationshipDto: UserRelationshipDto = {
                id: 100, // 파라미터로 보내는 id와 이 id가 일치해야 함.
                fromUserId: sub,
                toUserId: 2,
                status: UserRelationshipStatus.BLOCK
            }
            const updateControllerSpy = jest.spyOn(userRelationshipController, 'update');

            // When
            const result = userRelationshipController.update(sub, paramId, userRelationshipDto);

            // Then
            await expect(result).rejects.toThrow(UserRelationshipIdParamMismatchException);
            expect(updateControllerSpy).toHaveBeenCalledWith(sub, paramId, userRelationshipDto);
        });

    });
});