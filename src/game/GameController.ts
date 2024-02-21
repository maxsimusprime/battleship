import {
  Player,
  Position,
  RequestAddShipsData,
  RequestAddUserToRoomData,
  RequestAttackData,
  RequestRegData,
  ResponseAttack,
  ResponseAttackData,
  Room,
  User,
  Winner,
} from 'types/types.js';
import { Game } from './Game.js';
import { generateUID } from 'utils/generateUID.js';

export class GameController {
  private _users: User[];

  private _rooms: Room[];

  private _winners: Winner[];

  private _games: Game[];

  constructor() {
    this._users = [];
    this._rooms = [];
    this._winners = [];
    this._games = [];
  }

  public reg(index: number, messageData: string): string {
    const data = JSON.parse(messageData) as RequestRegData;
    const { name } = data;
    const isNameUniq = !this._users.find((user) => user.name === name);
    if (isNameUniq) {
      this._users.push({ name, index });
      return JSON.stringify({ name, index, error: false, errorText: '' });
    } else {
      return JSON.stringify({
        name,
        index,
        error: true,
        errorText: `User ${name} is already exists`,
      });
    }
  }

  public createRoom(index: number): void {
    const user = this._users.find((user) => user.index === index);
    if (user && !this.isUserInAnyRoom(index)) {
      const room: Room = {
        roomId: generateUID(),
        roomUsers: [user],
      };
      this._rooms.push(room);
    }
  }

  public addUserToRoom(index: number, messageData: string): Room {
    const data = JSON.parse(messageData) as RequestAddUserToRoomData;
    const { indexRoom } = data;
    const user = this._users.find((user) => user.index === index);
    const roomIndex = this._rooms.findIndex(
      (room) => room.roomId === indexRoom
    );
    if (
      user &&
      roomIndex > -1 &&
      !this.isUserInRoom(user, this._rooms[roomIndex])
    ) {
      this._rooms[roomIndex].roomUsers.push(user);
    }
    const room = { ...this._rooms[roomIndex] };
    if (this._rooms[roomIndex].roomUsers.length > 1)
      this._rooms = this._rooms.filter((room) => room.roomId !== roomIndex);
    return room;
  }

  public deleteUserFromAllRooms(index: number) {
    this._rooms.forEach(({ roomId, roomUsers }) => {
      const userId = roomUsers.findIndex((user) => user.index === index);
      if (userId > -1) {
        if (roomUsers.length < 2) {
          this._rooms = this._rooms.filter(
            (roomToDelete) => roomToDelete.roomId !== roomId
          );
        } else {
          roomUsers = roomUsers.filter(
            (userToDelete) => userToDelete.index !== index
          );
        }
      }
    });
  }

  public getRoomListInStringFormat(): string {
    return JSON.stringify(this._rooms);
  }

  public getWinnerListInStringFormat(): string {
    return JSON.stringify(this._winners);
  }

  public createGame(userId: number, roomId: number): string {
    const existedGame = this._games.find((game) => game.id === roomId);
    const game = existedGame || new Game(roomId, userId);
    if (!existedGame) this._games.push(game);
    this._rooms = this._rooms.filter((room) => room.roomId !== roomId);
    return JSON.stringify(game.getGameInfo(userId));
  }

  public addShips(index: number, messageData: string): Player[] {
    const { gameId, ships } = JSON.parse(messageData) as RequestAddShipsData;
    const game = this._games.find((game) => game.id === gameId);
    return game ? game?.addPlayer(index, ships) : [];
  }

  public startGame(gameId: number, playerId: number): string {
    const game = this._games.find((game) => game.id === gameId);
    return JSON.stringify(game?.startGame(playerId));
  }

  public getGameIdByPlayerId(playerId: number): number {
    const game = this._games.find((game) =>
      game.getPlayersInfo().find((player) => player.indexPlayer === playerId)
    );
    return game?.id as number;
  }

  public getEnemyIdByPlayerId(playerId: number): number {
    const gameId = this.getGameIdByPlayerId(playerId);
    const game = this._games.find((game) => game.id === gameId);
    const enemy = game?.getPlayersInfo().find((player) => player.indexPlayer !== playerId);
    return enemy?.indexPlayer as number;
  }

  public getTurn(gameId: number): string {
    const game = this._games.find((game) => game.id === gameId);
    return JSON.stringify(game?.getCurrentTurn());
  }

  public attack(
    index: number,
    messageData: string
  ): ResponseAttack | undefined {
    const { gameId, x, y, indexPlayer } = JSON.parse(
      messageData
    ) as RequestAttackData;
    const game = this._games.find((game) => game.id === gameId);
    const players = game?.getPlayersInfo() as Player[];
    const res = game?.attack(indexPlayer, { x, y }) as ResponseAttackData[];
    const isHit = res.find(
      (data) => data.status === 'shot' || data.status === 'killed'
    );
    if (res.length > 0) {
      if (!isHit) game?.changeCurrentPlayer();
      const turn = game?.getCurrentTurn();
      return {
        players,
        turn: JSON.stringify(turn),
        dataArray: res?.map((data) => JSON.stringify(data)),
      };
    }
  }

  public randomAttack(
    index: number,
    messageData: string
  ): ResponseAttack | undefined {
    const { gameId, indexPlayer } = JSON.parse(
      messageData
    ) as RequestAttackData;
    const game = this._games.find((game) => game.id === gameId);
    const players = game?.getPlayersInfo() as Player[];
    const position = game?.getRandomPosition(indexPlayer) as Position;
    const res = game?.attack(indexPlayer, position) as ResponseAttackData[];
    const isHit = res.find(
      (data) => data.status === 'shot' || data.status === 'killed'
    );
    if (res.length > 0) {
      if (!isHit) game?.changeCurrentPlayer();
      const turn = game?.getCurrentTurn();
      return {
        players,
        turn: JSON.stringify(turn),
        dataArray: res?.map((data) => JSON.stringify(data)),
      };
    }
  }

  public getCurrentTurnPlayerId(gameId: number): number {
    const game = this._games.find((game) => game.id === gameId);
    return Number(game?.getCurrentPlayer());
  }

  public isFinish(index: number, gameId: number): boolean {
    const game = this._games.find((game) => game.id === gameId) as Game;
    return game?.getEnemyRemainedCells(index) <= 0;
  }

  public updateWinnersTable(index: number): void {
    const { name } = this._users[index];
    const winnerId = this._winners.findIndex((winner) => winner.name === name);
    if (winnerId > -1) {
      this._winners[winnerId].wins += 1;
    } else {
      this._winners.push({ name, wins: 1 });
    }
  }

  public finish(index: number, gameId: number) {
    const game = this._games.find((game) => game.id === gameId) as Game;
    return {
      players: game.getPlayersInfo(),
      data: JSON.stringify({ winPlayer: index }),
    };
  }

  public isUserInAnyRoom(index: number): boolean {
    return !!this._rooms.find((room) =>
      room.roomUsers.find((roomUser) => roomUser.index === index)
    );
  }

  private isUserInRoom(user: User, room: Room): boolean {
    return !!room.roomUsers.find((roomUser) => roomUser === user);
  }

  public isUserInAnyGame(index: number): boolean {
    return !!this._games.find((game) =>
      game.getPlayersInfo().find((player) => player.indexPlayer === index)
    );
  }
}
