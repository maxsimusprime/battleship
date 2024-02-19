import {
  Cell,
  Player,
  Position,
  ResponseAttackData,
  Ship,
} from 'types/types.js';

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

  public getPlayersInfo() {
    return this.players;
  }

  public addPlayer(indexPlayer: number, ships: Ship[]): Player[] {
    const field = this.createField(ships);
    this.players.push({
      indexPlayer,
      ships,
      field,
      gameId: this.id,
      remained: 20,
    });
    return this.players;
  }

  public startGame(playerId: number) {
    return {
      currentPlayerIndex: playerId,
      ships: this.players.find((player) => player.indexPlayer === playerId),
    };
  }

  public getCurrentTurn() {
    return { currentPlayer: this.currentPlayer };
  }

  public getCurrentPlayer() {
    return this.currentPlayer;
  }

  public changeCurrentPlayer() {
    this.currentPlayer = this.players.find(
      (player) => player.indexPlayer !== this.currentPlayer
    )?.indexPlayer as number;
  }

  public attack(playerId: number, position: Position): ResponseAttackData[] {
    const res: ResponseAttackData[] = [];
    const enemyId = this.players.findIndex(
      (player) => player.indexPlayer !== playerId
    );

    const cellId = this.players[enemyId].field.findIndex(
      (cell) => cell.position.x === position.x && cell.position.y === position.y
    );
    if (cellId > -1) {
      if (!this.players[enemyId].field[cellId].isOpen) {
        if (!this.players[enemyId].field[cellId].isEmpty) {
          this.players[enemyId].field[cellId].isOpen = true;
          this.players[enemyId].remained -= 1;
          res.push({
            position,
            currentPlayer: playerId,
            status: 'shot',
          });
        } else {
          res.push({
            position,
            currentPlayer: playerId,
            status: 'miss',
          });
        }
      }
    } else {
      this.players[enemyId].field.push({
        position,
        linked: [],
        isEmpty: true,
        isOpen: true,
      });
      res.push({
        position,
        currentPlayer: playerId,
        status: 'miss',
      });
    }
    return res;
  }

  public getEnemyRemainedCells(playerId: number) {
    const enemyId = this.players.findIndex(
      (player) => player.indexPlayer !== playerId
    );
    return this.players[enemyId].remained;
  }

  private createField(ships: Ship[]): Cell[] {
    const field: Cell[] = [];
    ships.forEach((ship) => {
      const { position, direction, length } = ship;
      Array.from({ length })
        .map((_, index) => ({
          position: {
            x: direction ? position.x : position.x + index,
            y: direction ? position.y + index : position.y,
          },
          isEmpty: false,
          isOpen: false,
        }))
        .map((cell, _, arr) => ({
          ...cell,
          linked: arr
            .filter(
              (el) =>
                el.position.x !== cell.position.x &&
                el.position.y !== cell.position.y
            )
            .map((el) => el.position),
        }))
        .forEach((cell) => field.push(cell));
    });
    return field;
  }
}
