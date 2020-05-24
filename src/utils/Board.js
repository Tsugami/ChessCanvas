const Piece = require('./Piece');
const { PIECES, TEAMS } = require('./constants');

class Board extends Array {
  build () {
    this._addInitialPieces(TEAMS.WHITE, 2, 1);
    this._addInitialPieces(TEAMS.BLACK, 7, 8);
  }

  _addInitialPieces (team, frontline, backline) {
    for (let column = 0; column <= 8; column++) {
      super.push(new Piece(PIECES.PAWN, team, frontline, column));
    }
    super.push(new Piece(PIECES.ROOK, team, backline, 1));
    super.push(new Piece(PIECES.ROOK, team, backline, 8));
    super.push(new Piece(PIECES.BISHOP, team, backline, 3));
    super.push(new Piece(PIECES.BISHOP, team, backline, 6));
    super.push(new Piece(PIECES.KNIGHT, team, backline, 2));
    super.push(new Piece(PIECES.KNIGHT, team, backline, 7));
    super.push(new Piece(PIECES.KING, team, backline, 4));
    super.push(new Piece(PIECES.QUEEN, team, backline, 5));
  }

  move (startRow, startColumn, endRow, endColumn) {
    const piece = this.find(startRow, startColumn);
    if (!piece) return;

    const captured =  this.capture(endRow, endColumn);
    
    piece.row = endRow;
    piece.column = endColumn;
    piece.isInitialPosition = false;
    
    return { captured }
  }

  capture (row, column) {
    const capturedIndex = this.findIndex(this.findHandle(row, column));
    if (capturedIndex >= 0) {
      this.splice(capturedIndex, 1);
      return true
    }

    return false;
  }

  has (row, column) {
    return this.some(this.findHandle(row, column));
  }

  find (row, column) {
    return super.find(this.findHandle(row, column));
  }

  hasAdversary (row, column, team) {
    return super.find(p => this.findHandle(row, column)(p) && p.isAdversary(team))
  }

  findHandle (row, column) {
    return p => p.row === row && p.column === column
  }
}

module.exports = Board;