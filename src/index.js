// https://www.npmjs.com/package/validate-color
// https://www.megajogos.com.br/xadrez-online/regras
const { createCanvas, loadImage } = require('canvas')
const path = require('path');
const errors = require('./errors');

class Pieces extends Array {
  get (row, column) {
    return this.find(c => c.row === row && c.column === column);
  }

  add (piece, row, column, isInitialPosition = false) {
    return this.push({ row, column, piece, isInitialPosition });
  }
}

class ChessCanvas {
  constructor ({
    moveColor = '#ffff00',
    capturedColor = '#ff0000',
    pieceWidth = 50,
    pieceHeigth = 50,
    squareWhiteColor = '#fff',
    squareBlackColor = '#B8681A',
  } = {}) {
    this.pieces = new Pieces();

    this.canvas = null;
    this.canvasContext = null;
    this.pieceImages = null;

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
  }

  get boardWidth () {
    return this.pieceWidth * 8;
  }

  get boardHeigth () {
    return this.pieceHeigth * 8;
  }

  async init () {
    this.canvas = createCanvas(this.boardWidth, this.boardHeigth);
    this.canvasContext = this.canvas.getContext('2d');
    this.pieceImages = await this.loadPieceImages();

    this._drawSquares();
    this._setInitialPieces('white', 2, 1);
    this._setInitialPieces('black', 7, 8);
    this._drawInitialPieces();
  }

  _setInitialPieces (color, frontRow, backRow) {
    for (let column = 0; column <= 8; column++) {
      this.pieces.add(`${color}Pawn`, frontRow, column, true);
    }
    this.pieces.add(`${color}Rook`, backRow, 1, true);
    this.pieces.add(`${color}Rook`, backRow, 8, true);
    this.pieces.add(`${color}Bishop`, backRow, 3, true);
    this.pieces.add(`${color}Bishop`, backRow, 6, true);
    this.pieces.add(`${color}Knight`, backRow, 2, true);
    this.pieces.add(`${color}Knight`, backRow, 7, true);
    this.pieces.add(`${color}King`, backRow, 4, true);
    this.pieces.add(`${color}Queen`, backRow, 5, true);
  }

  _drawSquares (squares = 64) {
    let x = 0;
    let y = 0;
    for (let i = 0; i < squares; i++) {
      if (i !== 0 && i % 8 === 0) {
        y += 1;
        x = 0;
      }
      const squareColor = (i + y) % 2 ? this.squareWhiteColor : this.squareBlackColor;
      const squareX = x * this.pieceWidth;
      const squareY = y * this.pieceHeigth;
      this._drawSquare(squareColor, squareX, squareY)
      x += 1;
    }
  }

  _drawSquare (color, x, y) {
    this.canvasContext.fillStyle = color;
    this.canvasContext.fillRect(x, y, this.pieceWidth, this.pieceHeigth);
  }

  _drawInitialPieces () {
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
}

module.exports = ChessCanvas;