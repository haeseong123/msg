import { Test, TestingModule } from '@nestjs/testing';
import { MsgRealtimeController } from 'apps/msg-realtime/src/msg-realtime.controller';
import { MsgRealtimeService } from 'apps/msg-realtime/src/msg-realtime.service';

describe('MsgRealtimeController', () => {
  let msgRealtimeController: MsgRealtimeController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MsgRealtimeController],
      providers: [MsgRealtimeService],
    }).compile();

    msgRealtimeController = app.get<MsgRealtimeController>(
      MsgRealtimeController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(msgRealtimeController.getHello()).toBe('Hello World!');
    });
  });
});
