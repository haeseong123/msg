import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SocketWithAuth } from '../socket-types';
import { TokenPayload } from '@app/msg-core/jwt/token-payload';

export const SocketTokenMiddleware =
  (jwtService: JwtService, logger: Logger) =>
  async (socket: SocketWithAuth, next) => {
    const token =
      socket.handshake.headers['authorization']?.replace('Bearer ', '') ||
      socket.handshake.auth.token ||
      socket.handshake.headers['token'];

    try {
      const payload: TokenPayload = await jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      socket.sub = payload.sub;
      socket.email = payload.email;
      socket.nickname = payload.nickname;
      next();
    } catch (e) {
      logger.error(e.message);
      next(new Error(e.message));
    }
  };
