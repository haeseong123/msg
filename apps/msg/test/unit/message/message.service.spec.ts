import { ChatRoomParticipant } from "@app/msg-core/entities/chat-room/chat-room-participant/chat-room-participant.entity";
import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";
import { Message } from "@app/msg-core/entities/message/message.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { ChatRoomService } from "apps/msg/src/chat-room/chat-room.service";
import { FindAllMessageInfoDto } from "apps/msg/src/message/dto/find-all-message-info.dto";
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

    describe('dto.chatRoomId에 해당되는 채팅방의 모든 메시지 가져오기', () => {
        let findAllMessageInfoDto: FindAllMessageInfoDto;
        let participant: ChatRoomParticipant;
        let chatRoom: ChatRoom;
        let messages: Message[];

        beforeEach(() => {
            const [userId, chatRoomId] = [1, 1];

            findAllMessageInfoDto = new FindAllMessageInfoDto(userId, chatRoomId);
            participant = ChatRoomParticipant.of(chatRoomId, userId);
            chatRoom = ChatRoom.of('', [participant]);
            messages = [];
        });

        it('성공', async () => {
            // Given
            jest.spyOn(chatRoomService, 'findByIdOrThrow').mockResolvedValue(chatRoom);
            jest.spyOn(messageRepository, 'findAllByChatRoomId').mockResolvedValue(messages);

            // When
            const result = await messageService.findAllByChatRoomIdAndUserId(findAllMessageInfoDto);

            // Then
            expect(result).toStrictEqual(messages);
        });
    });

    describe('메시지 저장', () => {
        let messageSaveDto: MessageSaveDto;
        let participant: ChatRoomParticipant;
        let chatRoom: ChatRoom;

        beforeEach(() => {
            const [userId, chatRoomId] = [1, 1];

            messageSaveDto = new MessageSaveDto(userId, chatRoomId, 'content');
            participant = ChatRoomParticipant.of(chatRoomId, userId);
            chatRoom = ChatRoom.of('', [participant]);
        });

        it('성공', async () => {
            // Given
            const savedMessage = messageSaveDto.toEntity();
            jest.spyOn(chatRoomService, 'findByIdOrThrow').mockResolvedValue(chatRoom);
            jest.spyOn(messageRepository, 'save').mockResolvedValue(savedMessage);

            // When
            const result = await messageService.save(messageSaveDto);

            // Then
            expect(result).toStrictEqual(savedMessage);
        });
    });

    describe('채팅방에 있는 모든 메시지 삭제', () => {
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