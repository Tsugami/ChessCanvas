const Canvas = require('./Canvas');
const Board = require('./utils/Board');
const { SideType, PieceType, Errors } = require('./utils/constants');
const Movement = require('./Movement');

class ChessCanvas {
  constructor (initialTurn = SideType.WHITE, canvasOptions) {
    this.turn = initialTurn;
    this.board = new Board();
    this._canvas = new Canvas(canvasOptions);
    this.lastMovemnt = null;
  }

  getNextTurn (turn = this.turn) {
    return turn ===  SideType.WHITE ? SideType.WHITE : SideType.BLACK; 
  }

  getCanvas () {
    return this._canvas._canvas;
  }

  async init () {
    this.board.build();
    await this._canvas.init(this.board);
  }

  render () {
    return this._canvas.render(this.board, this.lastMovemnt);
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

  validatePawnSwap (swap) {
    return Object.values(PieceType)
      .filter(p => p !== PieceType.PAWN)
      .includes(swap)
  }

  isPawnSwap (piece, row) {
    if (piece.type === PieceType.PAWN) {
      if (piece.side === SideType.BLACK && row === 1) return true;
      if (piece.side === SideType.WHITE && row === 8) return true;
    }
    return false;
  }

  move (startRow, startColumn, endRow, endColumn, { hook = true, pawnSwap = PieceType.QUEEN } = {}) {
    if (!this.validatePawnSwap(pawnSwap)) {
      throw new Error(Errors.PAWN_SWAP)
    }

    const piece = this.board.find(startRow, startColumn);

    if (!piece) {
      throw new Error(Errors.squareEmply(startRow, startColumn));
    }
  
    const possibilities = piece.getMovement(this.board);
    
    const movement = possibilities.find(
      ({ row, column }) => row === endRow && column === endColumn
    );

    if (!movement) throw new Error(Errors.invalidMovement);

    const captured = this.board.capture(endRow, endColumn);
    
    piece.row = endRow;
    piece.column = endColumn;
    piece.isInitialPosition = false;
    
    if (movement.hookData && hook) {
      const rook = this.board.find(movement.hookData.row, movement.hookData.column);
      rook.column = endColumn > startColumn ? endColumn - 1 : endColumn + 1;
    }

    if (this.isPawnSwap(piece, endRow)) {
      piece.type = pawnSwap;
    }

    this._canvas.drawMovement({
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

  checkCheckmate () {
    const kings = this.board.filter(p => p.type === PieceType.KING);
    for (const king of kings) {
      king.side = king.adversary;
      if (king.getMovement(this.board).length > 0) {
        break;
      } 
      const allies = Movement.all(this.board, king, 1).filter(p => p.piece);
      if (allies.length > 0) {
        break;
      }
      king.side = king.adversary;
      for (const adversary of Movement.all(this.board, king, 1)) {
        const piece = Movement.findCapturePiece(this.board, adversary);
        if (piece) {
          const canBeCapture = Movement.findCapturePiece(this.board, piece.piece);
          if (canBeCapture) {
            return false;
          }
        }
      }
      return king;
    }
    return false;
  }
}

module.exports = ChessCanvas;