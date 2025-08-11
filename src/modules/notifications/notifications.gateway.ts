import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*', // в продакшене укажи домен
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Храним мапу userId -> socket.id (или массива socket.id)
  private activeUsers = new Map<number, string>();

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token as string;

      if (!token) {
        console.log('No token provided, disconnecting');
        client.disconnect(true);
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      this.activeUsers.set(userId, client.id);
      console.log(`User ${userId} connected with socket ${client.id}`);
    } catch (e) {
      console.log('Token verification failed:', e.message);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    // Удаляем юзера из мапы по socket.id
    for (const [userId, socketId] of this.activeUsers.entries()) {
      if (socketId === client.id) {
        this.activeUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  }

  // Метод для отправки уведомления конкретному пользователю по userId
  sendBookingNotification(data: {
    userId: number;
    roomName: string;
    startTs: Date;
  }) {
    const socketId = this.activeUsers.get(data.userId);
    if (socketId) {
      this.server.to(socketId).emit('bookingNotification', {
        roomName: data.roomName,
        startTs: data.startTs,
      });
    }
  }
}
