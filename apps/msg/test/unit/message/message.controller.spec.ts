import { Test, TestingModule } from "@nestjs/testing";
import { MessageSaveDto } from "apps/msg/src/message/dto/message-save.dto";
import { MessageDto } from "apps/msg/src/message/dto/message.dto";
import { MessageController } from "apps/msg/src/message/message.controller";
import { MessageService } from "apps/msg/src/message/message.service";

describe('MessageController', () => {
    let messageController: MessageController;
    let messageService: MessageService;

    beforeEach(async () => {
        const messageServiceMock = {
            save: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [MessageController],
            providers: [
                {
                    provide: MessageService,
                    useValue: messageServiceMock,
                },
            ]
        }).compile();

        messageController = module.get<MessageController>(MessageController);
        messageService = module.get<MessageService>(MessageService);
    });

    // describe('userId랑 chatRoomId로 메시지 다 가져오기', () => {
    //     it('성공', async () => {
    //         // Given
    //         const userId = 1;
    //         const chatRoomId = 1;
    //         const messages = [];
    //         const resultDto = messages.map(m => MessageDto.of(m));
    //         jest.spyOn(messageService, 'findAllByChatRoomIdAndUserId').mockResolvedValue(messages);

    //         // When
    //         const result = await messageController.findAllByChatRoomIdAndUserId(userId, chatRoomId);

    //         // Then
    //         expect(result).toStrictEqual(resultDto);
    //     });
    // });

    describe('메시지 저장', () => {
        it('성공', async () => {
            // Given
            const messageSaveDto = new MessageSaveDto(1, 1, '');
            const savedMessage = messageSaveDto.toEntity();
            const resultDto = MessageDto.of(savedMessage);
            
            jest.spyOn(messageService, 'save').mockResolvedValue(savedMessage);

            // When
            const result = await messageController.save(messageSaveDto);

            // Then
            expect(result).toStrictEqual(resultDto);
        });
    });
});