import { ChatRoomParticipant } from "@app/msg-core/entities/chat-room/chat-room-participant/chat-room-participant.entity";
import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { ChatRoomService } from "apps/msg/src/chat-room/chat-room.service";
import { MessageSaveDto } from "apps/msg/src/message/dto/message-save.dto";
import { MessageRepository } from "apps/msg/src/message/message.repository";
import { MessageService } from "apps/msg/src/message/message.service";

describe('MessageService', () => {
    let messageService: MessageService;
    let messageRepository: MessageRepository;
    let chatRoomService: ChatRoomService;

    beforeEach(async () => {
        const messageRepositoryMock = {
            findAllByChatRoomId: jest.fn(),
            save: jest.fn(),
            removeAll: jest.fn(),
        };
        const chatRoomServiceMock = {
            findByIdOrThrow: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MessageService,
                {
                    provide: MessageRepository,
                    useValue: messageRepositoryMock
                },
                {
                    provide: ChatRoomService,
                    useValue: chatRoomServiceMock
                },
            ]
        }).compile();

        messageService = module.get<MessageService>(MessageService);
        messageRepository = module.get<MessageRepository>(MessageRepository);
        chatRoomService = module.get<ChatRoomService>(ChatRoomService);
    });

    describe('chatRoomId에 해당되는 채팅방에 보낸 모든 메시지를 가져옵니다.', () => {
        it('성공', async () => {
            // Given
            const messages = [];

            jest.spyOn(messageRepository, 'findAllByChatRoomId').mockResolvedValue(messages);

            // When
            const result = await messageService.findAllByChatRoomId(1);

            // Then
            expect(result).toStrictEqual(messages);
        });
    });

    describe('메시지를 저장합니다.', () => {
        it('성공', async () => {
            // Given
            const [userId, chatRoomId] = [1, 1];
            const messageSaveDto = new MessageSaveDto(userId, chatRoomId, 'content');
            const participant = ChatRoomParticipant.of(chatRoomId, userId);
            const chatRoom = ChatRoom.of('', [participant]);
            const message = messageSaveDto.toEntity();

            jest.spyOn(chatRoomService, 'findByIdOrThrow').mockResolvedValue(chatRoom);
            jest.spyOn(chatRoom, 'findParticipantByUserIdOrThrow').mockImplementation(() => participant);
            jest.spyOn(messageSaveDto, 'toEntity').mockReturnValue(message);
            jest.spyOn(messageRepository, 'save').mockResolvedValue(message);

            // When
            const result = await messageService.save(messageSaveDto);

            // Then
            expect(result).toStrictEqual(message);
        });
    });

    describe('chatRoomId에 해당되는 채팅방에 보낸 모든 메시지를 삭제합니다.', () => {
        it('성공', async () => {
            // Given
            const messages = [];
            const removedMessage = [];

            jest.spyOn(messageRepository, 'findAllByChatRoomId').mockResolvedValue(messages);
            jest.spyOn(messageRepository, 'removeAll').mockResolvedValue(removedMessage);

            // When
            const result = await messageService.removeAllByChatRoomId(1);

            // Given
            expect(result).toStrictEqual(removedMessage);
        });
    });
});