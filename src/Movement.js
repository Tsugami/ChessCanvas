const { PieceType, SideType } = require('./utils/constants');

class Movement {
  static createSquareData ({
    row,
    column,
    side,
    capture = false,
    piece = null,
  }) {
    return {
      row,
      column,
      side,
      capture,
      piece,
    }
  }

  static validate (row, column) {
    return row <= 8 &&
    row >= 1 &&
    column <= 8 &&
    column >= 1
  }

  static find (board, side, row, column) {
    if (!Movement.validate(row, column)) {
      return { data: null, stop: true }
    }

    const result = {
      data: {
        row,
        side,
        column
      },
      stop: false,
    };

    const piece = board.find(row, column);
    if (!piece) {
      result.stop = false;
    } else if (piece.isAdversary(side)) {
      result.stop = true;
      result.data.piece = piece;
      result.data.capture = true;
    } else {
      result.stop = true;
      result.data = null;
    }

    if (result.data) {
      result.data = Movement.createSquareData(result.data)
    }

    return result;
  }

  static board (board, side, count, func) {
    const results = [];
    for (let i = 1; i <= count; i++) {
      const [row, column] = func(i);
      const result = Movement.find(board, side, row, column);
      if (result.data) results.push(result.data);
      if (result.stop) break;
    }
    return results;
  }

  static below (board, piece, count) {
    return Movement.board(board, piece.side, count, i => [piece.row + i, piece.column])
  }

  static belowLeft (board, piece, count) {
    return Movement.board(board, piece.side, count, i => [piece.row + i, piece.column - i])
  }

  static belowRight (board, piece, count) {
    return Movement.board(board, piece.side, count, i => [piece.row + i, piece.column + i])
  }

  static above (board, piece, count) {
    return Movement.board(board, piece.side, count, i => [piece.row - i, piece.column])
  }

  static aboveLeft (board, piece, count) {
    return Movement.board(board, piece.side, count, i => [piece.row - i, piece.column - i])
  }

  static aboveRight (board, piece, count) {
    return Movement.board(board, piece.side, count, i => [piece.row - i, piece.column + i])
  }

  static left (board, piece, count) {
    return Movement.board(board, piece.side, count, i => [piece.row, piece.column - i]);
  }

  static right (board, piece, count) {
    return Movement.board(board, piece.side, count, i => [piece.row, piece.column + i])
  }

  static all (board, piece, count) {
    return [
      ...Movement.above(board, piece, count),
      ...Movement.aboveLeft(board, piece, count),
      ...Movement.aboveRight(board, piece, count),
      ...Movement.below(board, piece, count),
      ...Movement.belowLeft(board, piece, count),
      ...Movement.belowRight(board, piece, count),
      ...Movement.left(board, piece, count),
      ...Movement.right(board, piece, count),
    ]
  }

  static knightBelowLeft (board, piece) {
    return this.find(board, piece.side, piece.row + 2, piece.column - 1).data;
  }

  static knightBelowRight (board, piece) {
    return this.find(board, piece.side, piece.row + 2, piece.column + 1).data;
  }

  static knightLeftBelow (board, piece) {
    return this.find(board, piece.side, piece.row + 1, piece.column - 2).data;
  }

  static knightLeftAbove (board, piece) {
    return this.find(board, piece.side, piece.row - 1, piece.column -2).data;
  }

  static knightAboveLeft (board, piece) {
    return this.find(board, piece.side, piece.row - 2, piece.column - 1).data;
  }

  static knightAboveRight (board, piece) {
    return this.find(board, piece.side, piece.row - 2, piece.column + 1).data;
  }

  static knightRightAbove (board, piece) {
    return this.find(board, piece.side, piece.row - 1, piece.column + 2).data;
  }

  static knightRightBelow (board, piece) {
    return this.find(board, piece.side, piece.row + 1, piece.column + 2).data;
  }

  static [PieceType.BISHOP] (board, piece) {
    return [
      ...Movement.belowLeft(board, piece, 8),
      ...Movement.belowRight(board, piece, 8),
      ...Movement.aboveLeft(board, piece, 8),
      ...Movement.aboveRight(board, piece, 8),
    ]
  }


  static [PieceType.ROOK] (board, piece) {
    return [
      ...Movement.below(board, piece, 8),
      ...Movement.above(board, piece, 8),
      ...Movement.right(board, piece, 8),
      ...Movement.left(board, piece, 8)
    ]
  }

  static [PieceType.QUEEN] (board, piece) {
    return Movement.all(board, piece, 8)
  }

  static [PieceType.PAWN] (board, piece) {
    const count = piece.isInitialPosition ? 2 : 1;
    const captureHandler = data => data.capture
    if (piece.side === SideType.BLACK) {
      return [
        ...Movement.above(board, piece, count),
        ...Movement.aboveLeft(board, piece, 1)
        .filter(captureHandler),
        ...Movement.aboveRight(board, piece, 1)
        .filter(captureHandler),
      ];
    } else {
      return [
        ...Movement.below(board, piece, count),
        ...Movement.belowLeft(board, piece, 1)
        .filter(captureHandler),
        ...Movement.belowRight(board, piece, 1)
        .filter(captureHandler),
      ];
    }
  }

 static [PieceType.KNIGHT] (board, piece) {
  return [
    this.knightAboveLeft(board, piece),
    this.knightAboveRight(board, piece),
    this.knightBelowLeft(board, piece),
    this.knightBelowRight(board, piece),
    this.knightLeftAbove(board, piece),
    this.knightLeftBelow(board, piece),
    this.knightRightAbove(board, piece),
    this.knightRightBelow(board, piece),
  ].filter(data => data);
  }

  static [PieceType.KING] (board, piece) {
    const result = Movement.all(board, piece, 1);
    for (const i in result) {
      const validate = (arr, types) => {
        const r = arr
          .filter(data => data.piece)
          .some(data => types.includes(data.piece.type))
        return r;
      }
      if (validate(Movement[PieceType.ROOK](board, result[i]), [PieceType.ROOK, PieceType.QUEEN])) {
        result.splice(i, 1);
        continue;
      }
      if (validate(Movement[PieceType.BISHOP](board, result[i]), [PieceType.BISHOP, PieceType.QUEEN])) {
        result.splice(i, 1);
        continue;
      }
      if (validate(Movement[PieceType.KNIGHT](board, result[i]), [PieceType.KNIGHT])) {
        result.splice(i, 1);
        continue;
      }
      if (piece.side === SideType.BLACK) {
        if (validate(Movement.aboveLeft(board, result[i], 1), [PieceType.PAWN])) {
          result.splice(i, 1);
          continue;
        }
        if (validate(Movement.aboveRight(board, result[i], 1), [PieceType.PAWN])) {
          result.splice(i, 1);
          continue;
        }
      } else {
        if (validate(Movement.belowLeft(board, result[i], 1), [PieceType.PAWN])) {
          result.splice(i, 1);
          continue;
        }
        if (validate(Movement.belowRight(board, result[i], 1), [PieceType.PAWN])) {
          result.splice(i, 1);
          continue;
        }
      }
    }
    return result;
  }
}

module.exports = Movement;