import {
  Message,
  MessageType,
  Position,
  RequestAttackData,
  ResponseAttackData,
  ResponseCreateGameData,
  ResponseTurnData,
  Ship,
} from 'types/types.js';
import WebSocket from 'ws';

const sendMessage = (type: MessageType, data: string, ws: WebSocket): void => {
  const message = JSON.stringify({ type, data, id: 0 });
  ws.send(message);
};

export class Bot {
  private gameId: number;

  private botName: string;

  private socket: WebSocket;

  private botId?: number;

  private attackList?: Position[] = [];

  constructor(gameId: number) {
    this.gameId = gameId;
    this.botName = `bot_${gameId}`;
    this.socket = new WebSocket('ws://localhost:3000');
  }

  public init() {
    this.socket.on('open', () => {
      this.socket.send(
        JSON.stringify({
          type: 'reg',
          data: JSON.stringify({ name: this.botName, password: 'password' }),
          id: 0,
        })
      );
      this.socket.send(
        JSON.stringify({
          type: 'add_user_to_room',
          data: JSON.stringify({ indexRoom: this.gameId }),
          id: 0,
        })
      );
    });

    this.socket.on('message', (rawData) => {
      const { type, data } = JSON.parse(rawData.toString()) as Message;

      switch (type) {
        case 'create_game':
          const { idGame: gameId, idPlayer: indexPlayer } = JSON.parse(
            data
          ) as ResponseCreateGameData;
          this.botId = indexPlayer;
          const ships = this.createShipsPosition();
          const shipsDataString = JSON.stringify({
            gameId,
            ships,
            indexPlayer,
          });
          sendMessage('add_ships', shipsDataString, this.socket);
          break;

        case 'turn':
          const { currentPlayer } = JSON.parse(data) as ResponseTurnData;
          if (currentPlayer === this.botId) {
            const { x, y } = this.getRandomPosition();
            const attackData: RequestAttackData = {
              gameId: this.gameId,
              x,
              y,
              indexPlayer: currentPlayer,
            };
            const attackDataString = JSON.stringify(attackData);
            setTimeout(() => {
              sendMessage('attack', attackDataString, this.socket);
            }, 500);
          }
          break;

        case 'attack':
          const attackData = JSON.parse(data) as ResponseAttackData;
          if (
            'status' in attackData &&
            attackData.currentPlayer === this.botId
          ) {
            const { x, y } = attackData.position;
            const isAttackInList = this.attackList?.find(
              (position) => position.x === x && position.y === y
            );
            if (!isAttackInList) this.attackList?.push({ x, y });
          }
          break;

        default:
          break;
      }
    });
  }

  private createShipsPosition(): Ship[] {
    return [
      { position: { x: 1, y: 4 }, direction: false, type: 'huge', length: 4 },
      { position: { x: 8, y: 4 }, direction: true, type: 'large', length: 3 },
      { position: { x: 3, y: 0 }, direction: true, type: 'large', length: 3 },
      {
        position: { x: 6, y: 6 },
        direction: true,
        type: 'medium',
        length: 2,
      },
      {
        position: { x: 3, y: 6 },
        direction: true,
        type: 'medium',
        length: 2,
      },
      {
        position: { x: 0, y: 8 },
        direction: false,
        type: 'medium',
        length: 2,
      },
      {
        position: { x: 0, y: 2 },
        direction: false,
        type: 'small',
        length: 1,
      },
      { position: { x: 5, y: 1 }, direction: true, type: 'small', length: 1 },
      { position: { x: 4, y: 9 }, direction: true, type: 'small', length: 1 },
      {
        position: { x: 0, y: 6 },
        direction: false,
        type: 'small',
        length: 1,
      },
    ];
  }

  private getRandomPosition(): Position {
    const x = Math.floor(Math.random() * 10);
    const y = Math.floor(Math.random() * 10);
    const isExist = this.attackList?.find(
      (position) => position.x === x && position.y === y
    );
    return isExist ? this.getRandomPosition() : { x, y };
  }
}
