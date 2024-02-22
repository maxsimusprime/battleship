import {
  Cell,
  Player,
  Position,
  ResponseAttackData,
  ResponseCreateGameData,
  ResponseTurnData,
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

  public getGameInfo(playerId: number): ResponseCreateGameData {
    return { idGame: this.id, idPlayer: playerId };
  }

  public getPlayersInfo(): Player[] {
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

  public getCurrentTurn(): ResponseTurnData {
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

    const enemy = this.players.find(
      (player) => player.indexPlayer !== playerId
    );

    const cell = enemy?.field.find(
      (cell) => cell.position.x === position.x && cell.position.y === position.y
    );

    if (cellId > -1) {
      if (!this.players[enemyId].field[cellId].isOpen) {
        if (!this.players[enemyId].field[cellId].isEmpty) {
          this.players[enemyId].field[cellId].isOpen = true;
          this.players[enemyId].remained -= 1;
          const isKilled = !this.players[enemyId].field[cellId].linked.find(
            (pos) =>
              !this.players[enemyId].field.find(
                (cell) => cell.position.x === pos.x && cell.position.y === pos.y
              )?.isOpen
          );
          if (isKilled) {
            res.push({
              position,
              currentPlayer: playerId,
              status: 'killed',
            });
            const shipCellPositions = this.getShipCellPositions(
              this.players[enemyId].field[cellId]
            );
            shipCellPositions.forEach((position) => {
              res.push({
                position,
                currentPlayer: playerId,
                status: 'killed',
              });
            });
            const cellAroundShipPosition =
              this.getCellAroundShipPosition(shipCellPositions);
            cellAroundShipPosition.forEach((position) => {
              res.push({
                position,
                currentPlayer: playerId,
                status: 'miss',
              });
            });
          } else {
            res.push({
              position,
              currentPlayer: playerId,
              status: 'shot',
            });
          }
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

  public getRandomPosition(playerId: number): Position {
    const enemyId = this.players.findIndex(
      (player) => player.indexPlayer !== playerId
    );
    const x = Math.floor(Math.random() * 10);
    const y = Math.floor(Math.random() * 10);
    const isExist = this.players[enemyId].field
      .filter((cell) => cell.isOpen)
      .find((cell) => cell.position.x === x && cell.position.y === y);
    return isExist ? this.getRandomPosition(playerId) : { x, y };
  }

  private createField(ships: Ship[]): Cell[] {
    const field: Cell[] = [];
    ships.forEach((ship) => {
      const {
        position: { x, y },
        direction,
        length,
      } = ship;
      Array.from({ length })
        .map((_, index) => ({
          position: {
            x: direction ? x : x + index,
            y: direction ? y + index : y,
          },
          isEmpty: false,
          isOpen: false,
        }))
        .map((cell, _, arr) => ({
          ...cell,
          linked: arr
            .map((cell) => cell.position)
            .filter(
              (pos) => pos.x !== cell.position.x || pos.y !== cell.position.y
            ),
        }))
        .forEach((cell) => field.push(cell));
    });
    return field;
  }

  private getShipCellPositions(cell: Cell): Position[] {
    const result: Position[] = [];
    result.push(cell.position);
    cell.linked.forEach((position) => result.push(position));
    return result;
  }

  private getCellAroundShipPosition(positions: Position[]): Position[] {
    const result: Position[] = [];
    positions.forEach(({ x, y }) => {
      const startX = x - 1;
      const endX = x + 1;
      const startY = y - 1;
      const endY = y + 1;

      for (let posX = startX; posX <= endX; posX++) {
        for (let posY = startY; posY <= endY; posY++) {
          if (
            posX >= 0 &&
            posY >= 0 &&
            (posX !== x || posY !== y) &&
            !result.find((pos) => pos.x === posX && pos.y === posY) &&
            !positions.find((pos) => pos.x === posX && pos.y === posY)
          ) {
            result.push({ x: posX, y: posY });
          }
        }
      }
    });
    return result;
  }
}
