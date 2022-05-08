import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { Server, Socket } from 'socket.io';
import { pubClient as Redis } from '../../redis.adapter';
import { MessageInterface } from './constant/message.interface';
import { EventName } from './constant/event-name.enum';
import { Exception } from './constant/exception.enum';

@Injectable()
export class EventsService {
  private readonly logger = new LoggerService(EventsService.name);

  joinRoom(client: Socket, server: Server, payload: MessageInterface) {
    const { roomId } = payload;
    Redis.get(roomId, (err, data) => {
      if (err)
        return this.emitError({ client, server }, Exception.ROOM_ENTER_ERROR);
      if (!data) {
        this.createRoom(client, payload);
      } else {
        this.updateRoom(client, data, payload);
      }
      this.emitGetUserList(server, roomId);
    });
  }

  emitGetUserList(server: Server, uuid: string) {
    Redis.get(uuid, (err, data) => {
      if (err || !data)
        return this.emitError(
          { client: { id: uuid }, server },
          Exception.ROOM_ENTER_ERROR,
        );
      server.to(uuid).emit(EventName.USER_LIST, JSON.parse(data).userList);
    });
  }

  updateRoom(
    client: Socket,
    roomDataStringfiedJson: string,
    payload: MessageInterface,
  ) {
    const rawRoomData = JSON.parse(roomDataStringfiedJson);
    rawRoomData.userList[client.id] = payload;
    //this.saveRoomByUUID(payload.roomId, rawRoomData); why it runs?
    Redis.multi()
      .set(payload.roomId, JSON.stringify(rawRoomData))
      .set(client.id, payload.roomId)
      .exec();
  }

  saveRoomByUUID(uuid: string, data: any) {
    Redis.set(uuid, JSON.stringify(data));
  }

  createRoom(client: Socket, payload: MessageInterface) {
    const newRoom = {
      userList: {},
    };
    newRoom.userList = { [client.id]: { payload } };
    Redis.multi()
      .set(payload.roomId, JSON.stringify(newRoom))
      .set(client.id, payload.roomId)
      .exec();
  }

  emitError({ client, server }, message) {
    server.to(client.id).emit(EventName.ERROR, message);
  }

  disconnect(client: Socket, server: Server) {
    Redis.get(client.id, (err, uuid) => {
      if (err || !uuid)
        return this.emitError({ client, server }, Exception.USER_NOT_FOUND);
      Redis.get(uuid, async (err, data) => {
        if (err || !data)
          return this.emitError({ client, server }, Exception.ROOM_NOT_FOUND);
        const rawRoomData = JSON.parse(data);
        const personalName = (
          rawRoomData['userList'][client.id] as MessageInterface
        ).name;
        for (const userInfo of Object.entries(rawRoomData.userList)) {
          const [key, value]: any = userInfo;
          if (value.name === personalName) {
            delete rawRoomData['userList'][key];
            Redis.del(key);
            break;
          }
        }
        this.saveRoomByUUID(uuid, rawRoomData);
        //await this.leaveRoomRequestToApiServer(uuid);
        this.emitGetUserList(server, uuid);
      });
    });
  }
}
