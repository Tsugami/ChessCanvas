// https://www.npmjs.com/package/validate-color
// https://www.megajogos.com.br/xadrez-online/regras
const errors = require('./errors');
const Canvas = require('./Canvas');
const Board = require('./utils/Board');
const { TEAMS } = require('./utils/constants');

class ChessCanvas {
  constructor (initialTurn = TEAMS.WHITE, canvasOptions) {
    this.turn = initialTurn;
    this.board = new Board();
    this.canvas = new Canvas(canvasOptions);
    this.lastMovemnt = null;
  }

  getNextTurn (turn = this.turn) {
    return turn ===  TEAMS.WHITE ? TEAMS.WHITE : TEAMS.BLACK; 
  } 

  async init () {
    this.board.build();
    await this.canvas.init(this.board);
  }

  render () {
    return this.canvas.render(this.board, this.lastMovemnt);
  }

  _setLastMovement (
    piece,
    startRow,
    startColumn,
    endRow,
    endColumn,
    captured,
    ) {
    this.lastMovemnt = {
      piece,
      startRow,
      startColumn,
      endRow,
      endColumn,
      captured,
    }
  }

  move (startRow, startColumn, endRow, endColumn) {
    const piece = this.board.find(startRow, startColumn);

    if (!piece) {
      throw new Error(errors.squareEmply(startRow, startColumn));
    }
  
    const possibilities = this.getPossibilities(piece);
    
    const movement = possibilities.find(
      ({ row, column }) => row === endRow && column === endColumn
    );

    if (!movement) throw new Error(errors.invalidMovement);

    const {captured } = this.board.move(
      startRow,
      startColumn,
      endRow,
      endColumn,
    );
    
    this.canvas.drawMovement({
      piece,
      startRow,
      startColumn,
      endRow,
      endColumn,
      captured
    })
    
    this.lastMovemnt = {
      piece,
      startRow,
      startColumn,
      endRow,
      endColumn,
      captured: movement.capture,
    }

    this.turn = this.getNextTurn(this.turn);
  }

  getPossibilities ({ name, row, column, isInitialPosition }) {
    const possibilities = [];

    const addPossib = (possibRow, possibColumn, team, canCapture = false) => {
      const piece = this.board.find(possibRow, possibColumn);
      if (piece && !piece.isAdversary(team)) return;
      return possibilities.push({
        row: possibRow,
        column: possibColumn,
        capture: canCapture && piece,
      })
    }

    const addKnightPossib = (turn) => {
      // L TOP
      addPossib(row + 2, column + 1, turn, true);
      addPossib(row + 2, column - 1, turn, true);
      // L RIGHT
      addPossib(row - 1, column + 2, turn, true);
      addPossib(row + 1, column + 2, turn, true);
      // L LEFT
      addPossib(row - 1, column - 2, turn, true);
      addPossib(row + 1, column - 2, turn, true);
      // L BACK
      addPossib(row - 2, column - 1, turn, true);
      addPossib(row - 2, column + 1, turn, true);
    }

    const addBoardPossib = (team, func, count = 8) => {
      for (let i = 1; i <= count; i++) {
        const [rookRow, rookColumn] = func(i);
        if (
          rookRow > 8 ||
          rookRow < 1 ||
          rookColumn > 8 ||
          rookColumn < 1
          ) return;
        const piece = this.board.find(rookRow, rookColumn)
        if (piece) {
          if (!piece.isAdversary(team)) return;
          addPossib(rookRow, rookColumn, team, true);
          return;
        }
        addPossib(rookRow, rookColumn, team, false);
      }
    }

    const addVerticalPossib = (turn, count = 8) => {
      addBoardPossib(turn, i => [row + i, column], count)
      addBoardPossib(turn, i => [row - i, column], count)
      addBoardPossib(turn, i => [row, column + i], count)
      addBoardPossib(turn, i => [row, column - i], count)
    }

    const addDiagonalPossib = (turn, count = 8) => {
      addBoardPossib(turn, i => [row + i, column + i], count)
      addBoardPossib(turn, i => [row - i, column + i], count)
      addBoardPossib(turn, i => [row + i, column - i], count)
      addBoardPossib(turn, i => [row - i, column - i], count)
    }

    const kingPossib = (turn) => {
      addVerticalPossib(turn, 1);
      addDiagonalPossib(turn, 1);
      const searchAdversaries = (row, column) => {
        const searchAdversary = func => {
          for (let i = 1; i <= 8; i++) {
            const [rookRow, rookColumn] = func(i);
            if (
              rookRow > 8 ||
              rookRow < 1 ||
              rookColumn > 8 ||
              rookColumn < 1
              ) return;
            const piece = this.board.find(
              d => d.row === rookRow && d.column === rookColumn
            )
            if (piece) return piece.isAdversary(turn) ? null : piece;
          }
        }
        return [
          searchAdversary(i => [row + i, column]),
          searchAdversary(i => [row - i, column]),
          searchAdversary(i => [row, column + i]),
          searchAdversary(i => [row, column - i]),
          searchAdversary(i => [row + i, column + i]),
          searchAdversary(i => [row - i, column + i]),
          searchAdversary(i => [row + i, column - i]),
          searchAdversary(i => [row - i, column - i]),
        ].filter(c => c);
      }
      
      const adversaries = []

      for (const p of possibilities) {
        for (const a of searchAdversaries(p.row, p.column)) {
          adversaries.push(a);
        }
      }
      for (const data of adversaries) {
        for (const p of this.getPossibilities(data)) {
          const i = possibilities.findIndex(d =>
            d.row === p.row && d.column === p.column
          )
          if (i >= 0) {
            possibilities.splice(i, 1)
          }
        }
      }
    }

    switch (name) {
      case 'whitePawn':
        addPossib(row + 1, column, 'white', false);
        if (this.board.hasAdversary(row + 1, column + 1, 'white')) {
          addPossib(row + 1, column + 1, 'black', true);
        }
        if (this.board.hasAdversary(row + 1, column - 1, 'white')) {
          addPossib(row + 1, column - 1, 'black', true);
        }
        if (isInitialPosition) {
          addPossib(row + 2, column, 'white', false)
        }
        break;
      case 'blackPawn':
        addPossib(row - 1, column, 'black', false);
        if (this.board.hasAdversary(row -1, column - 1, 'white')) {
          addPossib(row - 1, column - 1, 'black', true);
        }
        if (this.board.hasAdversary(row -1, column + 1, 'white')) {
          addPossib(row - 1, column + 1, 'black', true);
        }
        if (isInitialPosition) {
          addPossib(row - 2, column, 'black', false);
        }
        break;
      case 'blackKnight':
        addKnightPossib('black');
        break;
      case 'whiteKnight':
        addKnightPossib('white');
        break;
      case 'whiteRook':
        addVerticalPossib('white');
        break;
      case 'blackRook':
        addVerticalPossib('black');
        break;
      case 'blackBishop':
        addDiagonalPossib('black');
        break;
      case 'whiteBishop':
        addDiagonalPossib('white');
        break;
      case 'blackQueen':
        addDiagonalPossib('black');
        addVerticalPossib('black');
        break;
      case 'whiteQueen':
        addDiagonalPossib('white');
        addVerticalPossib('white');
        break;
      case 'blackKing':
        kingPossib('black');
        break;
      case 'whiteKing':
        kingPossib('white');
        break;
      default:
        break;
    }

    return possibilities
      .filter(c =>
        c.row <= 8 &&
        c.row >= 1 &&
        c.column <= 8 &&
        c.column >= 1
      )
  }

  checkCheckmate () {
    const kings = this.board.filter(p => p.piece.toLowerCase().includes('king'));
    for (const k of kings) {
      for (const possibilities of this.getPossibilities(k, false)) {
        if (possibilities.length === 0) {
          return k
        }
      }
    }
  }
}

module.exports = ChessCanvas;