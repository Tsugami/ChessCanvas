const PieceType = {
  PAWN: 'pawn',
  QUEEN: 'queen',
  KING: 'king',
  ROOK: 'rook',
  BISHOP: 'bishop',
  KNIGHT: 'knight'
}

const SideType = {
  WHITE: 'white',
  BLACK: 'black'
}

const Errors = {
  invalidMovement: 'INVALID_MOVEMNT',
  PAWN_SWAP: 'PAWN_SWAP',
  squareEmply: (row, column) => `SQUARE_EMPLY: There are no pieces in row ${row} column ${column}`,
 }
module.exports = {
  PieceType,
  SideType,
  Errors,
}
