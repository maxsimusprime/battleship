import {
  Game,
  RequestAddUserToRoomData,
  RequestRegData,
  Room,
  User,
  Winner,
} from 'types/types.js';

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
        roomId: this._rooms.length,
        roomUsers: [user],
      };
      this._rooms.push(room);
    }
  }

  public addUserToRoom(index: number, messageData: string): User[] {
    const data = JSON.parse(messageData) as RequestAddUserToRoomData;
    const { indexRoom } = data;
    const user = this._users.find((user) => user.index === index);
    if (user && !this.isUserAlreadyInRoom(user, this._rooms[indexRoom])) {
      this._rooms[indexRoom].roomUsers.push(user);
    }
    return this._rooms[indexRoom].roomUsers;
  }

  public updateRoom(): string {
    return JSON.stringify(this._rooms);
  }

  public updateWinners(): string {
    return JSON.stringify(this._winners);
  }

  public createGame(index: number): string {
    const game = { idGame: this._games.length, idPlayer: index };
    return JSON.stringify(game);
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
