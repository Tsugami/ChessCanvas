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
    } else if (piece.adversary === side) {
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
    const block = [];
    for (const piece of result) {
      if (Movement.findCapturePiece(board, piece)) {
        block.push(piece)
      }
    }
    return result.filter(r => !block.some(board.findHandle(r.row, r.column)));
  }

  static findCapturePiece (board, piece) {
    const findPiece = (arr, types) => {
      return arr
        .filter(data => data.piece)
        .find(data => types.includes(data.piece.type))
    }
    const cross = findPiece(Movement[PieceType.ROOK](board, piece), [PieceType.ROOK, PieceType.QUEEN])
    if (cross) {
      return cross
    }
    const diagonalCross = findPiece(Movement[PieceType.BISHOP](board, piece), [PieceType.BISHOP, PieceType.QUEEN])
    if (diagonalCross) {
      return diagonalCross;
    }

    const knight = findPiece(Movement[PieceType.KNIGHT](board, piece), [PieceType.KNIGHT])
    if (knight) {
      return knight;
    }

    if (piece.side === SideType.BLACK) {
      const aboveLeft = findPiece(Movement.aboveLeft(board, piece, 1), [PieceType.PAWN])
      if (aboveLeft) {
        return aboveLeft;
      }
      const aboveRight = findPiece(Movement.aboveRight(board, piece, 1), [PieceType.PAWN])
      if (aboveRight) {
        return aboveRight;
      }
    } else {
      const aboveLeft = findPiece(Movement.belowLeft(board, piece, 1), [PieceType.PAWN])
      if (aboveLeft) {
        return aboveLeft;
      }
      const belowRight = findPiece(Movement.belowRight(board, piece, 1), [PieceType.PAWN]);
      if (belowRight) {
        return belowRight;
      }
    }
    const king = findPiece(Movement.all(board, piece, 1), [PieceType.KING]);
    return king;
  }
}

module.exports = Movement;