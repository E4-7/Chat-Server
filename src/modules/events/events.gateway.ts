import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LoggerService } from '../logger/logger.service';
import { EventsService } from './events.service';
import { EventName } from './constant/event-name.enum';
import { IMessage } from './constant/message.interface';

@WebSocketGateway({ cors: true, allowEIO3: true })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly eventsService: EventsService) {}
  @WebSocketServer() public server: Server;
  private readonly logger = new LoggerService(EventsGateway.name);

  @SubscribeMessage(EventName.SEND_MSG_TO_ALL)
  handleMessageToAll(client: any, payload: IMessage) {
    this.server.to(payload.roomId).emit(EventName.SEND_MSG_TO_ALL, payload);
  }

  @SubscribeMessage(EventName.SEND_MSG_TO_MANAGER)
  handleMessageToManager(client: any, payload: IMessage) {
    this.server.to(payload.roomId).emit(EventName.SEND_MSG_TO_MANAGER, payload);
  }

  @SubscribeMessage(EventName.JOIN_ROOM)
  async handleJoinRoom(client: any, payload: IMessage) {
    await client.leave(client.id);
    await client.join(payload.roomId);
    this.logger.log(`${client.id} is joined this room!`);
    this.eventsService.joinRoom(client, this.server, payload);
  }

  afterInit(server: Server) {
    this.logger.log('websocketserver init');
  }

  handleConnection(socket: Socket) {
    this.logger.log('connected', socket.nsp.name);
  }

  handleDisconnect(socket: Socket) {
    this.eventsService.disconnect(socket, this.server);
  }
}
