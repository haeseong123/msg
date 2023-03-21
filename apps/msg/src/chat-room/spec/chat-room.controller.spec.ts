import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedAccessException } from "../../exceptions/auth/unauthorized-access.exception";
import { ChatRoomController } from "../chat-room.controller";
import { ChatRoomService } from "../chat-room.service";
import { ChatRoomSaveDto } from "../dto/chat-room-save.dto";

describe('ChatRoomController', () => {
    let controller: ChatRoomController;
    let service: ChatRoomService;

    beforeEach(async () => {
        const serviceMock = {
            findChatRooms: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ChatRoomController],
            providers: [
                {
                    provide: ChatRoomService,
                    useValue: serviceMock
                }
            ]
        }).compile();

        controller = module.get<ChatRoomController>(ChatRoomController);
        service = module.get<ChatRoomService>(ChatRoomService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('채팅방_전부_가져오기', () => {
        it('성공', async () => {
            // Given
            const sub: number = 0;
            const controllerSpy = jest.spyOn(controller, 'findChatRooms');
            const serviceSpy = jest.spyOn(service, 'findChatRooms').mockResolvedValue(null);

            // When
            const result = await controller.findChatRooms(sub);

            // Then
            expect(controllerSpy).toHaveBeenCalledWith(sub);
            expect(serviceSpy).toHaveBeenCalledWith(sub);
            expect(result).toBe(null);
        });
    });

    describe('채팅방_생성하기', () => {
        it('성공', async () => {
            // Given
            const sub: number = 0;
            const dto: ChatRoomSaveDto = {
                name: "chat_room_name",
                invitedUserIds: [1, 2, 3],
            };
            const controllerSpy = jest.spyOn(controller, 'saveChatRoom');
            const serviceSpy = jest.spyOn(service, 'save').mockResolvedValue(null);

            // When
            const result = await controller.saveChatRoom(sub, dto);

            // Then
            expect(controllerSpy).toHaveBeenCalledWith(sub, dto);
            expect(serviceSpy).toHaveBeenCalledWith(sub, dto);
            expect(result).toBe(null);
        });
    });

    describe('채팅방_나가기', () => {
        it('성공', async () => {
            // Given
            const sub: number = 0;
            const id: number = 1;
            const userId: number = sub;
            const controllerSpy = jest.spyOn(controller, 'deleteUserFromChatRoom');
            const serviceSpy = jest.spyOn(service, 'delete').mockResolvedValue(null);

            // When
            const result = await controller.deleteUserFromChatRoom(sub, id, userId);

            // Then
            expect(controllerSpy).toHaveBeenCalledWith(sub, id, userId);
            expect(serviceSpy).toHaveBeenCalledWith(id, userId);
            expect(result).toBe(null);
        });

        it('실패_sub와_userId_불일치', async () => {
            // Given
            const sub: number = 0;
            const id: number = 1;
            const userId: number = 2;
            const controllerSpy = jest.spyOn(controller, 'deleteUserFromChatRoom');

            // When
            const resultPromise = controller.deleteUserFromChatRoom(sub, id, userId);

            // Then
            await expect(resultPromise).rejects.toThrow(UnauthorizedAccessException);
            expect(controllerSpy).toHaveBeenCalledWith(sub, id, userId);
        });
    });
});