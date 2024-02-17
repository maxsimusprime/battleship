import {
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

  constructor() {
    this._users = [];
    this._rooms = [];
    this._winners = [];
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

  public addUserToRoom(index: number, messageData: string): void {
    const data = JSON.parse(messageData) as RequestAddUserToRoomData;
    const { indexRoom } = data;
    const user = this._users.find((user) => user.index === index);
    if (
      this._rooms[indexRoom] &&
      user &&
      !this.isUserAlreadyInRoom(user, this._rooms[indexRoom])
    ) {
      this._rooms[indexRoom].roomUsers.push(user);
    }
  }

  public updateRoom(): string {
    return JSON.stringify(this._rooms);
  }

  public updateWinners(): string {
    return JSON.stringify(this._winners);
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
