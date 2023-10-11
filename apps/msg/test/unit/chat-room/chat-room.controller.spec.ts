import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";
import { TestingModule, Test } from "@nestjs/testing";
import { ChatRoomController } from "apps/msg/src/chat-room/chat-room.controller";
import { ChatRoomService } from "apps/msg/src/chat-room/chat-room.service";
import { ChatRoomSaveDto } from "apps/msg/src/chat-room/dto/chat-room-save.dto";
import { ChatRoomDto } from "apps/msg/src/chat-room/dto/chat-room.dto";

describe('ChatRoomController', () => {
    let controller: ChatRoomController;
    let chatRoomService: ChatRoomService;

    beforeEach(async () => {
        const serviceMock = {
            findById: jest.fn(),
            findAllByUserId: jest.fn(),
            save: jest.fn(),
            leaveChatRoom: jest.fn(),
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
        chatRoomService = module.get<ChatRoomService>(ChatRoomService);
    });

    describe('채팅방_전부_가져오기', () => {
        it('성공', async () => {
            // Given
            const userId = 1;
            const chatRooms = [];
            const chatRoomDtos = chatRooms.map(cr => ChatRoomDto.of(cr));
            jest.spyOn(chatRoomService, 'findAllByUserId').mockResolvedValue(chatRooms);

            // When
            const result = await controller.findAllByUserId(userId);

            // Then
            expect(result).toStrictEqual(chatRoomDtos);
        });
    });

    describe('채팅방_생성하기', () => {
        it('성공', async () => {
            // Given
            const hostUserId = 1;
            const title = 'title';
            const invitedUserIds = [];
            const chatRoomSaveDto = new ChatRoomSaveDto(hostUserId, title, invitedUserIds);
            const chatRoom = ChatRoom.of(title, []);
            const chatRoomDto = ChatRoomDto.of(chatRoom);
            jest.spyOn(chatRoomService, 'save').mockResolvedValue(chatRoom);

            // When
            const result = await controller.save(chatRoomSaveDto);

            // Then
            expect(result).toStrictEqual(chatRoomDto);
        });
    });

    describe('채팅방_나가기', () => {
        it('성공', async () => {
            // Given
            const userId = 1;
            const id = 2;
            const leftChatRoom = ChatRoom.of('title', []);
            const chatRoomDto = ChatRoomDto.of(leftChatRoom);
            jest.spyOn(chatRoomService, 'leaveChatRoom').mockResolvedValue(leftChatRoom);

            // When
            const result = await controller.leave(userId, id);

            // Then
            expect(result).toStrictEqual(chatRoomDto);
        });
    });
});