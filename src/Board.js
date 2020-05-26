const Piece = require('./Piece');
const { PieceType, SideType } = require('./Constants');

class Board extends Array {
  build () {
    this._addInitialPieceType(SideType.WHITE, 2, 1);
    this._addInitialPieceType(SideType.BLACK, 7, 8);
  }

  _addInitialPieceType (team, frontline, backline) {
    for (let column = 0; column <= 8; column++) {
      super.push(new Piece(PieceType.PAWN, team, frontline, column));
    }
    super.push(new Piece(PieceType.ROOK, team, backline, 1));
    super.push(new Piece(PieceType.ROOK, team, backline, 8));
    super.push(new Piece(PieceType.BISHOP, team, backline, 3));
    super.push(new Piece(PieceType.BISHOP, team, backline, 6));
    super.push(new Piece(PieceType.KNIGHT, team, backline, 2));
    super.push(new Piece(PieceType.KNIGHT, team, backline, 7));
    super.push(new Piece(PieceType.KING, team, backline, 4));
    super.push(new Piece(PieceType.QUEEN, team, backline, 5));
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