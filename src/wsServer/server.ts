import { WebSocket, WebSocketServer } from 'ws';
import {
  Message,
  MessageType,
  RequestRegData,
  Room,
  User,
} from 'types/types.js';

const rooms: Room[] = [];

const users: User[] = [];

const sendMessage = (type: MessageType, data: string, ws: WebSocket): void => {
  ws.send(JSON.stringify({ type, data, id: 0 }));
};

const getResponseRegData = (index: number, messageData: string): string => {
  const data = JSON.parse(messageData) as RequestRegData;
  const { name } = data;
  users.push({ name, index });
  return JSON.stringify({ name, index, error: false, errorText: '' });
};

const getResponseCreateRoomData = (index: number) => {
  const roomUser = users.find((user) => user.index === index);
  if (roomUser) {
    const room: Room = {
      roomId: rooms.length,
      roomUsers: [roomUser],
    };
    rooms.push(room);
  }
  return JSON.stringify(rooms);
};

export const wsServer = (port: number): void => {
  const server = new WebSocketServer({ port });

  const socketArray: WebSocket[] = [];

  server.on('connection', (ws) => {
    socketArray.push(ws);

    ws.on('message', (data) => {
      const index = socketArray.findIndex((socket) => socket === ws);

      const message = JSON.parse(data.toString()) as Message;
      console.log(message);

      switch (message.type) {
        case 'reg':
          const responseRegData = getResponseRegData(index, message.data);
          sendMessage('reg', responseRegData, ws);
          break;
        case 'create_room':
          const responseCreateRoomData = getResponseCreateRoomData(index);
          sendMessage('update_room', responseCreateRoomData, ws);
          break;
        case 'add_user_to_room':
          sendMessage('update_room', '', ws);
          sendMessage('create_game', '', ws);
          break;
        case 'add_ships':
          break;
        case 'attack':
          break;
        case 'randomAttack':
          break;
        default:
          break;
      }
    });
  });
};
