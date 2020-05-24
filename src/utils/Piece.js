const Movement = require('../Movement');

class Piece {
  constructor (type, side, initialRow, initialColumn) {
    this.row = initialRow;
    this.column = initialColumn;
    this.type = type;
    this.side = side;
    this.isInitialPosition = true;
  }

  get name () {
    return `${this.side}${this.type[0].toUpperCase()}${this.type.slice(1)}`;
  }

  isAdversary (side) {
    return side !== this.side;
  }

  getMovement (board) {
    return Movement[this.type](board, this);
  }
}

module.exports = Piece;