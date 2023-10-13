import { TestingModule, Test } from "@nestjs/testing";
import { ChatRoomController } from "apps/msg/src/chat-room/chat-room.controller";
import { ChatRoomService } from "apps/msg/src/chat-room/chat-room.service";
import { ChatRoomSaveDto } from "apps/msg/src/chat-room/dto/chat-room-save.dto";
import { ChatRoomWithMessagesDto } from "apps/msg/src/chat-room/dto/chat-room-with-messages.dto";
import { ChatRoomDto } from "apps/msg/src/chat-room/dto/chat-room.dto";

describe('ChatRoomController', () => {
    let controller: ChatRoomController;
    let chatRoomService: ChatRoomService;

    beforeEach(async () => {
        const serviceMock = {
            findAllByUserId: jest.fn(),
            findChatRoomWithMessages: jest.fn(),
            save: jest.fn(),
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

    describe('채팅방 전부 가져오기', () => {
        it('성공', async () => {
            // Given
            const chatRooms = [];
            const chatRoomDtos = chatRooms.map(cr => ChatRoomDto.of(cr));

            jest.spyOn(chatRoomService, 'findAllByUserId').mockResolvedValue(chatRooms);

            // When
            const result = await controller.findAllByUserId(1);

            // Then
            expect(result).toStrictEqual(chatRoomDtos);
        });
    });

    describe('채팅방 상세 가져오기', () => {
        it('성공', async () => {
            // Given
            const chatRoomWithMessagesDto = new ChatRoomWithMessagesDto(1, '', [], []);
            
            jest.spyOn(chatRoomService, 'findChatRoomWithMessages').mockResolvedValue(chatRoomWithMessagesDto);

            // When
            const result = await controller.findByIdWithMessages(1, 2);

            // Then
            expect(result).toStrictEqual(chatRoomWithMessagesDto);
        });
    });

    describe('채팅방 생성하기', () => {
        it('성공', async () => {
            // Given
            const chatRoomSaveDto = new ChatRoomSaveDto(1, '', []);
            const savedChatRoom = chatRoomSaveDto.toEntity();
            const chatRoomDto = ChatRoomDto.of(savedChatRoom);

            jest.spyOn(chatRoomService, 'save').mockResolvedValue(savedChatRoom);

            // When
            const result = await controller.save(chatRoomSaveDto);

            // Then
            expect(result).toStrictEqual(chatRoomDto);
        });
    });
});