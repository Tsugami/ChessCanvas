const Movement = require('../Movement');
const { SideType } = require('./constants');
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

  get adversary () {
    return this.side === SideType.BLACK ? SideType.WHITE : SideType.BLACK;
  }

  getMovement (board) {
    return Movement[this.type](board, this);
  }
}

module.exports = Piece;