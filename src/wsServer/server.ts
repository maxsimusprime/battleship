import { WebSocket, WebSocketServer } from 'ws';
import { GameController } from 'game/GameController.js';
import { Message, MessageType, RequestAttackData } from 'types/types.js';

const controller = new GameController();

const sendMessage = (type: MessageType, data: string, ws: WebSocket): void => {
  const message = JSON.stringify({ type, data, id: 0 });
  console.log('Response message: ', message);
  ws.send(message);
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
          const responseRegData = controller.reg(index, data);
          sendMessage('reg', responseRegData, ws);
          server.clients.forEach((socket) => {
            if (socket.OPEN) {
              sendMessage('update_room', controller.updateRoom(), socket);
              sendMessage('update_winners', controller.updateWinners(), socket);
            }
          });
          break;

        case 'create_room':
          controller.createRoom(index);
          server.clients.forEach((socket) => {
            if (socket.OPEN) {
              sendMessage('update_room', controller.updateRoom(), socket);
              sendMessage('update_winners', controller.updateWinners(), socket);
            }
          });
          break;

        case 'add_user_to_room':
          const { roomId, roomUsers } = controller.addUserToRoom(index, data);
          if (roomUsers.length > 1) {
            roomUsers
              .map((user) => ({
                userId: user.index,
                socket: socketArray[user.index],
              }))
              .filter(({ socket }) => socket.OPEN)
              .forEach(({ userId, socket }) => {
                sendMessage(
                  'create_game',
                  controller.createGame(userId, roomId),
                  socket
                );
              });
          }
          server.clients.forEach((socket) => {
            if (socket.OPEN) {
              sendMessage('update_room', controller.updateRoom(), socket);
            }
          });
          break;

        case 'add_ships':
          const players = controller.addShips(index, data);
          if (players.length > 1) {
            const { gameId } = players[0];
            players
              .map((player) => ({
                playerId: player.indexPlayer,
                socket: socketArray[player.indexPlayer],
              }))
              .filter(({ socket }) => socket.OPEN)
              .forEach(({ playerId, socket }) => {
                sendMessage(
                  'start_game',
                  controller.startGame(gameId, playerId),
                  socket
                );
                sendMessage('turn', controller.getTurn(gameId), socket);
              });
          }
          break;
        case 'attack':
          const { gameId } = JSON.parse(data) as RequestAttackData;
          if (controller.getCurrentPlayerId(gameId) === index) {
            const attackFeedback = controller.attack(index, data);
            if (attackFeedback) {
              attackFeedback.players
                .map((player) => socketArray[player.indexPlayer])
                .filter((socket) => socket.OPEN)
                .forEach((socket) => {
                  attackFeedback.dataArray.forEach((data) => {
                    sendMessage('attack', data, socket);
                    sendMessage('turn', attackFeedback.turn, socket);
                  });
                });
            }
          }
          break;
        case 'randomAttack':
          const attackFeedback = controller.randomAttack(index, data);
          if (attackFeedback) {
            attackFeedback.players
              .map((player) => socketArray[player.indexPlayer])
              .filter((socket) => socket.OPEN)
              .forEach((socket) => {
                attackFeedback.dataArray.forEach((data) => {
                  sendMessage('attack', data, socket);
                  sendMessage('turn', attackFeedback.turn, socket);
                });
              });
          }
          break;
        default:
          break;
      }
    });
  });
};
