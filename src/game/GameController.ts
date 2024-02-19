import {
  Player,
  RequestAddShipsData,
  RequestAddUserToRoomData,
  RequestRegData,
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
    if (user && !this.isUserHasRoom(user)) {
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
      !this.isUserAlreadyInRoom(user, this._rooms[roomIndex])
    ) {
      this._rooms[roomIndex].roomUsers.push(user);
    }
    const room = { ...this._rooms[roomIndex] };
    if (this._rooms[roomIndex].roomUsers.length > 1)
      this._rooms = this._rooms.filter((room) => room.roomId !== roomIndex);
    return room;
  }

  public updateRoom(): string {
    return JSON.stringify(
      this._rooms.filter((room) => room.roomUsers.length === 1)
    );
  }

  public updateWinners(): string {
    return JSON.stringify(this._winners);
  }

  public createGame(index: number, roomId: number): string {
    const existedGame = this._games.find((game) => game.id === roomId);
    const game = existedGame || new Game(roomId, index);
    if (!existedGame) this._games.push(game);
    return JSON.stringify(game.getGameInfo());
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

  private isUserHasRoom(user: User): boolean {
    return !!this._rooms.find((room) =>
      room.roomUsers.find((roomUser) => roomUser === user)
    );
  }

  private isUserAlreadyInRoom(user: User, room: Room): boolean {
    return !!room.roomUsers.find((roomUser) => roomUser === user);
  }
}
