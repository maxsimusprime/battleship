export type MessageType =
  | 'reg'
  | 'update_winners'
  | 'create_room'
  | 'add_user_to_room'
  | 'create_game'
  | 'update_room'
  | 'add_ships'
  | 'start_game'
  | 'attack'
  | 'randomAttack'
  | 'turn'
  | 'finish';

export type Message = {
  type: MessageType;
  data: string;
  id: 0;
};

export type RequestRegData = {
  name: string;
  password: string;
};

export type User = {
  name: string;
  index: number;
};

export type RoomUser = {
  name: string;
  index: number;
};

export type Room = {
  roomId: number;
  roomUsers: User[];
};

export type Winner = {
  name: string;
  wins: number;
};

export type RequestAddUserToRoomData = {
  indexRoom: number;
};

export type Game = {
  idGame: number;
  idPlayer: number;
};

type ResponseRegMessage1 = {
  type: 'reg';
  data: {
    name: string;
    index: number;
    error: boolean;
    errorText: string;
  };
  id: 0;
};
