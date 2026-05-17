import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { AuthenticatedSocket } from '../interfaces/authenticated-socket.interface.js';

/**
 * Shared WebSocket JWT authentication helper.
 * Extracts and verifies JWT token from socket handshake,
 * then attaches user data to socket.data.
 *
 * Used by both ChatGateway and CallGateway to eliminate duplicate auth logic.
 *
 * @returns true if authentication succeeded, false otherwise
 */
export function authenticateSocket(
  client: AuthenticatedSocket,
  jwt: JwtService,
  config: ConfigService,
  logger: Logger,
): boolean {
  try {
    const token =
      client.handshake.auth?.['token'] ||
      client.handshake.headers?.['authorization']?.replace('Bearer ', '');

    if (!token) {
      logger.warn(`Client ${client.id} rejected: no token`);
      client.disconnect();
      return false;
    }

    const payload = jwt.verify(token, {
      secret: config.getOrThrow<string>('JWT_SECRET'),
    }) as { sub: string; username: string; role: string };

    // Attach user data to socket
    client.data.userId = payload.sub;
    client.data.username = payload.username;
    client.data.role = payload.role;

    return true;
  } catch {
    logger.warn(`Client ${client.id} rejected: invalid token`);
    client.disconnect();
    return false;
  }
}
