import { RequestRegData, Room, User, Winner } from 'types/types.js';

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

  public createRoom(index: number) {
    const user = this._users.find((user) => user.index === index);
    const isUserHasRoom = !!this._rooms.find((room) =>
      room.roomUsers.find((roomUser) => roomUser === user)
    );
    if (user && !isUserHasRoom) {
      const room: Room = {
        roomId: this._rooms.length,
        roomUsers: [user],
      };
      this._rooms.push(room);
    }
  }

  public updateRoom(): string {
    return JSON.stringify(this._rooms);
  }

  public updateWinners(): string {
    return JSON.stringify(this._winners);
  }
}
