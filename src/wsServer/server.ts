import { WebSocket, WebSocketServer } from 'ws';
import { GameController } from 'game/GameController.js';
import { Message, MessageType } from 'types/types.js';

const game = new GameController();

const sendMessage = (type: MessageType, data: string, ws: WebSocket): void => {
  ws.send(JSON.stringify({ type, data, id: 0 }));
};

export const wsServer = (port: number): void => {
  const server = new WebSocketServer({ port });

  const socketArray: WebSocket[] = [];

  server.on('connection', (ws) => {
    socketArray.push(ws);

    ws.on('message', (rawData) => {
      const index = socketArray.findIndex((socket) => socket === ws);

      const message = JSON.parse(rawData.toString()) as Message;
      console.log(message);

      const { type, data } = message;

      switch (type) {
        case 'reg':
          const responseRegData = game.reg(index, data);
          sendMessage('reg', responseRegData, ws);
          server.clients.forEach((client) => {
            if (client.OPEN) {
              sendMessage('update_room', game.updateRoom(), ws);
              sendMessage('update_winners', game.updateWinners(), ws);
            }
          });
          break;

        case 'create_room':
          game.createRoom(index);
          server.clients.forEach((client) => {
            if (client.OPEN) {
              sendMessage('update_room', game.updateRoom(), ws);
              sendMessage('update_winners', game.updateWinners(), ws);
            }
          });
          break;

        case 'add_user_to_room':
          game.addUserToRoom(index, data);
          server.clients.forEach((client) => {
            if (client.OPEN) {
              sendMessage('update_room', game.updateRoom(), ws);
              sendMessage('update_winners', game.updateWinners(), ws);
            }
          });
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
