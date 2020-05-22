module.exports = {
  invalidMovement: 'INVALID_MOVEMNT',
  invalidRow: 'INVALID_ROW: Row cannot be greater than 8 or less than 1.',
  invalidColumn: 'INVALID_COLUMN: Column cannot be greater than 8 or less than 1.',
  squareEmply: (row, column) => `SQUARE_EMPLY: There are no pieces in row ${row} column ${column}`,
  pawnInvalidMovemnt: 'PAWN_INVALID_MOVEMNT: The pawn can only make moves adjacent to its previous position, that is, it cannot move backwards. The pawn, like the king, can only move 1 square ahead per move, however, when the pawn is still in its starting position, it can jump 2 spaces ahead.'
}