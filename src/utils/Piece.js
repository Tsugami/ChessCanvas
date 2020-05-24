class Piece {
  constructor (piece, team, initialRow, initialColumn) {
    this.row = initialRow;
    this.column = initialColumn;
    this.piece = piece;
    this.team = team;
    this.isInitialPosition = true;
  }

  get name () {
    return `${this.team}${this.piece[0].toUpperCase()}${this.piece.slice(1)}`;
  }

  isAdversary (team) {
    return team !== team;
  }
}

module.exports = Piece;