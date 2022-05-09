export interface IMessage {
  sender: string;
  receiver?: string;
  msg: string;
  type: MessageType;
  name?: string;
  roomId: string;
}

const enum MessageType {
  NORMAL = 1,
  NOTICE,
  WARNNING,
}
