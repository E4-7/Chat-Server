import {
  ConnectedSocket,
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

@WebSocketGateway({ namespace: 'chat' })
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
  handleJoinRoom(client: any, payload: IMessage) {
    client.leave(client.id);
    client.join(payload.sender);
    this.eventsService.joinRoom(client, this.server, payload);
  }

  afterInit(server: Server) {
    this.logger.log('websocketserver init');
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log('connected', socket.nsp.name);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.eventsService.disconnect(socket, this.server);
  }
}
