// https://www.npmjs.com/package/validate-color
// https://www.megajogos.com.br/xadrez-online/regras
const { createCanvas, loadImage } = require('canvas')
const path = require('path');
const errors = require('./errors');

class ChessCanvas {
  constructor ({
    moveColor = '#ffff00',
    capturedColor = '#ff0000',
    pieceWidth = 50,
    pieceHeigth = 50,
    initialTurn = 'white',
    squareWhiteColor = '#fff',
    squareBlackColor = '#B8681A',
  } = {}) {
    this.pieces = [];

    this.canvas = null;
    this.canvasContext = null;
    this.pieceImages = null;

    this.turn = initialTurn;
    this.moveColor = moveColor;
    this.capturedColor = capturedColor;
    this.pieceWidth = pieceWidth;
    this.pieceHeigth = pieceHeigth;
    this.squareWhiteColor = squareWhiteColor;
    this.squareBlackColor = squareBlackColor;

    this.blackBishopImage = null;
    this.blackKingImage = null;
    this.blackKnightImage = null;
    this.blackPawnImage = null;
    this.blackQueenImage = null;
    this.blackRookImage = null;
    this.whiteBishopImage = null;
    this.whiteKingImage = null;
    this.whiteKnightImage = null;
    this.whitePawnImage = null;
    this.whiteQueenImage = null;
    this.whiteRookImage = null;
    this.lastMovemnt = {
      piece: null,
      startRow: null,
      startColumn: null,
      endColumn: null,
      endRow: null,
    }
  }

  get boardWidth () {
    return this.pieceWidth * 8;
  }

  get boardHeigth () {
    return this.pieceHeigth * 8;
  }

  capturePiece (row, column, turn = this.turn) {
    const i = this.pieces.findIndex(
      this._filter(
        row,
        column,
        this.getNextTurn(turn)
    ));
    if (i < 0) return false;
    this.pieces.splice(i, 1);
    return true
  }

  getNextTurn (turn = this.turn) {
    return turn === 'white' ? 'black' : 'white' 
  } 

  _filter (row, column, search) {
    return (pieceData) => 
    pieceData.row === row &&
    pieceData.column === column &&
    pieceData.piece.startsWith(search)
  }

  findPiece (row, column, turn = this.turn) {
    return this.pieces.find(this._filter(row, column, turn));
  }

  movePiece (piece, startRow, startColumn, endRow, endColumn, turn = this.turn) {
    this.pieces.splice(
      this.pieces.findIndex(
        this._filter(
          startRow,
          startColumn,
          this.getNextTurn(turn)
        )
      ),
      1,
      {
        piece,
        row: endRow,
        column: endColumn,
        isInitialPosition: false
      }
    )
  }

  addPiece (piece, row, column, isInitialPosition = false) {
    return this.pieces.push({ row, column, piece, isInitialPosition });
  }

  async init () {
    this.canvas = createCanvas(this.boardWidth, this.boardHeigth);
    this.canvasContext = this.canvas.getContext('2d');
    this.pieceImages = await this.loadPieceImages();

    this._setInitialPieces('white', 2, 1);
    this._setInitialPieces('black', 7, 8);
    this.render();
  }

  _setInitialPieces (color, frontRow, backRow) {
    for (let column = 0; column <= 8; column++) {
      this.addPiece(`${color}Pawn`, frontRow, column, true);
    }
    this.addPiece(`${color}Rook`, backRow, 1, true);
    this.addPiece(`${color}Rook`, backRow, 8, true);
    this.addPiece(`${color}Bishop`, backRow, 3, true);
    this.addPiece(`${color}Bishop`, backRow, 6, true);
    this.addPiece(`${color}Knight`, backRow, 2, true);
    this.addPiece(`${color}Knight`, backRow, 7, true);
    this.addPiece(`${color}King`, backRow, 4, true);
    this.addPiece(`${color}Queen`, backRow, 5, true);
  }

  _drawSquares (squares = 64) {
    let x = 0;
    let y = 0;
    for (let i = 0; i < squares; i++) {
      if (i !== 0 && i % 8 === 0) {
        y += 1;
        x = 0;
      }
      const squareColor = this._getSquareColor(x, y);
      const squareX = x * this.pieceWidth;
      const squareY = y * this.pieceHeigth;
      this._drawSquare(squareColor, squareX, squareY)
      x += 1;
    }
  }

  _getSquareColor (row, column) {
    return (column + row) % 2 ? this.squareWhiteColor : this.squareBlackColor;
  }

  _drawSquare (color, x, y) {
    this.canvasContext.fillStyle = color;
    this.canvasContext.fillRect(x, y, this.pieceWidth, this.pieceHeigth);
  }

  render () {
    this._drawSquares();
    for (const { piece, column, row } of this.pieces) {
      this._drawPiece(
        this._getPieceImage(piece),
        this._getX(column),
        this._getY(row)
      )
    }
  }

  _getPieceImage (piece) {
    return this[`${piece}Image`]
  }

  _getX (column) {
    return (column - 1) * this.pieceWidth;
  }

  _getY (row) {
    return (row - 1) * this.pieceHeigth;
  }

  _drawPiece = (pieceImage, x, y) => {
    this.canvasContext.drawImage(
      pieceImage, 
      x,
      y,
      this.pieceWidth,
      this.pieceHeigth
    )
  }

  async loadPieceImages () {
    this.blackBishopImage = await loadImage(path.join(__dirname, 'assets', 'bb.svg')),
    this.blackKingImage = await loadImage(path.join(__dirname, 'assets', 'bk.svg'))
    this.blackKnightImage = await loadImage(path.join(__dirname, 'assets', 'bn.svg'))
    this.blackPawnImage = await loadImage(path.join(__dirname, 'assets', 'bp.svg'))
    this.blackQueenImage = await loadImage(path.join(__dirname, 'assets', 'bq.svg'))
    this.blackRookImage = await loadImage(path.join(__dirname, 'assets', 'br.svg'))
    this.whiteBishopImage = await loadImage(path.join(__dirname, 'assets', 'wb.svg')),
    this.whiteKingImage = await loadImage(path.join(__dirname, 'assets', 'wk.svg'))
    this.whiteKnightImage = await loadImage(path.join(__dirname, 'assets', 'wn.svg'))
    this.whitePawnImage = await loadImage(path.join(__dirname, 'assets', 'wp.svg'))
    this.whiteQueenImage = await loadImage(path.join(__dirname, 'assets', 'wq.svg'))
    this.whiteRookImage = await loadImage(path.join(__dirname, 'assets', 'wr.svg'))
  }

  _drawMovement (pieceImage, startRow, startColumn, endRow, endColumn, captured = false) {
    const color = captured ? this.capturedColor : this.moveColor;
    this._drawSquare(color, this._getX(startColumn), this._getY(startRow));
    this._drawSquare(color, this._getX(endColumn), this._getY(endRow));
    this._drawPiece(pieceImage, this._getX(endColumn), this._getY(endRow));
  }

  _cleanLastMovemnt () {
    const {
      piece,
      startRow,
      startColumn,
      endRow,
      endColumn,
    } = this.lastMovemnt;

    if (
      !startRow ||
      !startColumn ||
      !endRow ||
      !endColumn
      ) return;
    this._drawSquare(
      this._getSquareColor(startRow, startColumn),
      this._getX(startColumn),
      this._getY(startRow));
    this._drawSquare(
      this._getSquareColor(endRow, endColumn),
      this._getX(endColumn),
      this._getY(endRow));
    this._drawPiece(
      this._getPieceImage(piece),
      this._getX(endColumn),
      this._getY(endRow));
  }

  move (startRow, startColumn, endRow, endColumn) {
    this._cleanLastMovemnt();

    const piece = this.findPiece(startRow, startColumn);
    if (!piece) {
      throw new Error(errors.squareEmply(startRow, startColumn));
    }
    const pieceName = piece.piece.replace(/black|white/i, '')
    const captured = this.capturePiece(endRow, endColumn);
    this.assertMovement(
      pieceName,
      startRow,
      startColumn,
      endRow,
      endColumn,
      captured,
      this.turn === 'white',
      piece.isInitialPosition,
    );

    this.movePiece(
      piece.piece,
      startRow,
      startColumn,
      endRow,
      endColumn,
      this.turn,
      );
    
    this._drawMovement(
      this._getPieceImage(piece.piece),
      startRow, startColumn, endRow, endColumn, captured
    )

    this.lastMovemnt = {
      piece: piece.piece,
      startRow,
      startColumn,
      endRow,
      endColumn,
    }

    this.turn = this.getNextTurn(this.turn);
  }

  assertMovement (
    pieceName,
    startRow,
    startColumn,
    endRow,
    endColumn,
    captured = false,
    isWhiteTurn = true,
    isInitialPosition = false,
  ) {
    const isSamePoistion = startRow === endRow && startColumn === endColumn;
    if (isSamePoistion) throw new Error(errors.invalidMovement);
    this.assertPosition(startRow, startColumn);
    this.assertPosition(endRow, endColumn);

    switch (pieceName) {
      case 'Pawn': {
        const isWhiteBackMove = isWhiteTurn && startRow > endRow;
        const isBlackBackMove = !isWhiteTurn && startRow < endRow;
        const isDifferentColumn = startColumn !== endColumn;
        const isWhiteDiagonalMove = isDifferentColumn && endRow !== (startRow + 1);
        const isBlackDiagonalMove = isDifferentColumn && endRow !== (startRow - 1);
        const isDiagonalMoveWithoutCapture = !captured && (isWhiteDiagonalMove || isBlackDiagonalMove);
        const isMoreTwoSquares = isWhiteTurn && endRow > (startRow + 2);
        const isWhiteTwoSquaresOutInitPos = isWhiteTurn && endRow === (startRow + 2) && !isInitialPosition;
        const isBlackTwoSquaresOutInitPos = !isWhiteTurn && endRow === (startRow - 2) && !isInitialPosition;
        if (
          isWhiteBackMove ||
          isBlackBackMove ||
          isDiagonalMoveWithoutCapture ||
          isMoreTwoSquares ||
          isWhiteTwoSquaresOutInitPos ||
          isBlackTwoSquaresOutInitPos
        ) {
          throw new Error(errors.pawnInvalidMovemnt)
        }
        break;
      }
    }
  }

  assertPosition (row, column) {
    const validate = x => x > 8 || x < 1;

    if (validate(row)) throw new Error(errors.invalidRow);
    if (validate(column)) throw new Error(errors.invalidColumn);
  }
}

module.exports = ChessCanvas;