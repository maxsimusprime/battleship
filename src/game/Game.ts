import { Player, Ship } from 'types/types.js';

export class Game {
  public id: number;

  private currentPlayer: number;

  private players: Player[] = [];

  constructor(id: number, currentPlayer: number) {
    this.id = id;
    this.currentPlayer = currentPlayer;
  }

  public getGameInfo() {
    return { idGame: this.id, idPlayer: this.currentPlayer };
  }

  public addPlayer(indexPlayer: number, ships: Ship[]) {
    this.players.push({ indexPlayer, ships, gameId: this.id });
    return this.players;
  }

  public startGame(playerId: number) {
    return {
      currentPlayerIndex: playerId,
      ships: this.players.find((player) => player.indexPlayer === playerId),
    };
  }
}
