import { NestFactory } from '@nestjs/core';
import { MsgRealtimeModule } from './msg-realtime.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(MsgRealtimeModule);

  const port: number = process.env.SERVER_PORT ? +process.env.SERVER_PORT : 3000
  console.log(`listening at ${port}`);

  await app.listen(port);
}
bootstrap();
