import { WebSocket, WebSocketServer } from 'ws';
import { GameController } from 'game/GameController.js';
import {
  Message,
  MessageType,
} from 'types/types.js';

const game = new GameController();

const sendMessage = (type: MessageType, data: string, ws: WebSocket): void => {
  ws.send(JSON.stringify({ type, data, id: 0 }));
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
          const responseRegData = game.reg(index, message.data);
          sendMessage('reg', responseRegData, ws);
          break;

        case 'create_room':
          game.createRoom(index);
          const responseUpdateRoomData = game.updateRoom();
          const responseUpdateWinnersData = game.updateWinners();
          server.clients.forEach((client) => {
            if (client.OPEN) {
              sendMessage('update_room', responseUpdateRoomData, ws);
              sendMessage('update_room', responseUpdateWinnersData, ws);
            }
          })
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
