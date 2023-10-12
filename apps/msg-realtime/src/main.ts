import { NestFactory } from '@nestjs/core';
import { MsgRealtimeModule } from './msg-realtime.module';

async function bootstrap() {
  const app = await NestFactory.create(MsgRealtimeModule);
  await app.listen(3000);
}
bootstrap();
