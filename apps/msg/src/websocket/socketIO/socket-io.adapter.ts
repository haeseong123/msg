import { INestApplicationContext, Logger } from '@nestjs/common';
import { isFunction } from '@nestjs/common/utils/shared.utils';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'socket.io';
import { SocketTokenMiddleware } from './middleware/socket-token-middleware';
import { SocketChatRoomIdMiddleware } from './middleware/socket-chat-room-id-middleware.';

export class SocketIoAdapter extends IoAdapter {
  private readonly logger = new Logger('SocketIoAdapter');
  private jwtService: JwtService;

  constructor(app: INestApplicationContext, private readonly corsOrigins = []) {
    super(app);
    this.jwtService = app.get(JwtService);
  }

  public create(
    port: number,
    options?: any & { namespace?: string; server?: any },
  ): any {
    if (!options) {
      return this.createIOServer(port);
    }
    const { namespace, server, ...opt } = options;
    return server && isFunction(server.of)
      ? server.of(namespace)
      : namespace
      ? this.createIOServer(port, opt).of(namespace)
      : this.createIOServer(port, opt);
  }

  public createIOServer(port: number, options = {}): any {
    if (this.httpServer && port === 0) {
      options = {
        cors: {
          origin: this.corsOrigins,
          methods: ['GET', 'POST'],
          credentials: true,
        },
        cookie: {
          name: 'io',
          httpOnly: true,
          path: '/',
        },
        maxHttpBufferSize: 1e6,
      };
    }

    const server: Server = super.createIOServer(port, options);
    server.of('/chat').use(SocketTokenMiddleware(this.jwtService, this.logger));
    server.of('/chat').use(SocketChatRoomIdMiddleware(this.logger));

    return server;
  }
}
