import { ChatRoom } from "@app/msg-core/entities/chat-room/chat-room.entity";
import { Message } from "@app/msg-core/entities/message/message.entity";
import { UserChatRoom } from "@app/msg-core/entities/user-chat-room/user-chat-room.entity";
import { User } from "@app/msg-core/entities/user/user.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { ChatRoomController } from "../chat-room.controller";
import { ChatRoomService } from "../chat-room.service";
import { ChatRoomMessageDto } from "../dto/chat-room-message.dto";
import { ChatRoomSaveDto } from "../dto/chat-room-save.dto";
import { ChatRoomUserDto } from "../dto/chat-room-user.dto";
import { ChatRoomDto } from "../dto/chat-room.dto";

describe('ChatRoomController', () => {
    let controller: ChatRoomController;
    let service: ChatRoomService;

    beforeEach(async () => {
        const serviceMock = {
            findAll: jest.fn(),
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
        it('성공_빈_방', async () => {
            // Given
            const userId: number = 1;
            const controllerSpy = jest.spyOn(controller, 'findAll');
            const serviceSpy = jest.spyOn(service, 'findAll').mockResolvedValue([]);

            // When
            const result = await controller.findAll(userId);

            // Then
            expect(controllerSpy).toHaveBeenCalledWith(userId);
            expect(serviceSpy).toHaveBeenCalledWith(userId);
            expect(result).toStrictEqual([]);
        });
        it('성공', async () => {
            // Given
            // 유저
            const userId: number = 1;
            const users: User[] = [
                new User('email@a.com', 'password1', 'address1', 'nickname1'),
                new User('email@b.com', 'password2', 'address2', 'nickname2'),
            ];
            users[0].id = 2;
            users[1].id = 3;

            // 채팅방
            const chatRoomId = 10;
            const userChatRooms: UserChatRoom[] = [
                new UserChatRoom(users[0].id, chatRoomId),
                new UserChatRoom(users[1].id, chatRoomId),
            ];
            userChatRooms[0].user = users[0];
            userChatRooms[1].user = users[1];

            const chatRooms: ChatRoom[] = [new ChatRoom('채팅방_이름')];
            chatRooms[0].id = chatRoomId;
            chatRooms[0].userChatRooms = userChatRooms;
            chatRooms[0].messages = [];

            const chatRoomDtos: ChatRoomDto[] = chatRooms.map(cr => new ChatRoomDto(
                cr.id,
                cr.name,
                cr.userChatRooms.map(ucr => new ChatRoomUserDto(ucr.user.id, ucr.user.email, ucr.user.nickname)),
                cr.messages.map(msg => new ChatRoomMessageDto(msg.id, msg.senderId, msg.content, msg.sentAt)),
            ));

            const controllerSpy = jest.spyOn(controller, 'findAll');
            const serviceSpy = jest.spyOn(service, 'findAll').mockResolvedValue(chatRooms);

            // When
            const result = await controller.findAll(userId);

            // Then
            expect(controllerSpy).toHaveBeenCalledWith(userId);
            expect(serviceSpy).toHaveBeenCalledWith(userId);
            expect(result).toStrictEqual(chatRoomDtos);
        });
    });

    describe('채팅방_생성하기', () => {
        it('성공', async () => {
            // Given
            const sub: number = 1;
            const dto = new ChatRoomSaveDto(1, 'chat_room_name', [3, 4, 5]);
            const chatRoomId: number = 2;
            const chatRoom: ChatRoom = new ChatRoom(dto.name);
            chatRoom.userChatRooms = [
                new UserChatRoom(sub, chatRoomId),
                new UserChatRoom(dto.invitedUserIds[0], chatRoomId),
                new UserChatRoom(dto.invitedUserIds[1], chatRoomId),
                new UserChatRoom(dto.invitedUserIds[2], chatRoomId),
            ];
            chatRoom.id = chatRoomId;
            const chatRoomSavedResultDto: ChatRoomSaveDto = new ChatRoomSaveDto(
                chatRoomId,
                dto.name,
                [sub, ...dto.invitedUserIds]
            );

            const controllerSpy = jest.spyOn(controller, 'save');
            const serviceSpy = jest.spyOn(service, 'save').mockResolvedValue(chatRoom);

            // When
            const result = await controller.save(sub, dto);

            // Then
            expect(controllerSpy).toHaveBeenCalledWith(sub, dto);
            expect(serviceSpy).toHaveBeenCalledWith(sub, dto);
            expect(result).toStrictEqual(chatRoomSavedResultDto);
        });
    });

    describe('채팅방_나가기', () => {
        it('성공', async () => {
            // Given
            const sub: number = 0;
            const id: number = 1;
            const userId: number = sub;

            const controllerSpy = jest.spyOn(controller, 'delete');
            const serviceSpy = jest.spyOn(service, 'delete').mockResolvedValue(null);

            // When
            const result = await controller.delete(userId, id);

            // Then
            expect(controllerSpy).toHaveBeenCalledWith(userId, id);
            expect(serviceSpy).toHaveBeenCalledWith(id, userId);
            expect(result).toBeNull();
        });
    });
});