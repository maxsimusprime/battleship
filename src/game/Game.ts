import { Player, Ship } from 'types/types.js';

export class Game {
  public id: number;

  private currentPlayer: number;

  private players: Player[] = [];

  constructor(id: number, currentPlayer: number) {
    this.id = id;
    this.currentPlayer = currentPlayer;
  }

  public getGameInfo(playerId: number) {
    return { idGame: this.id, idPlayer: playerId };
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

  public getCurrentPlayer() {
    return { currentPlayer: this.currentPlayer };
  }

  public changeCurrentPlayer() {
    this.currentPlayer = this.players.find(
      (player) => player.indexPlayer !== this.currentPlayer
    )?.indexPlayer as number;
  }
}
