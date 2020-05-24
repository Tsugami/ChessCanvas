const path = require('path');
const { createCanvas, loadImage } = require('canvas');
class Canvas {
  constructor ({
    moveColor = '#ffff00',
    capturedColor = '#ff0000',
    pieceWidth = 50,
    pieceHeigth = 50,
    squareWhiteColor = '#fff',
    squareBlackColor = '#B8681A',
  } = {}) {
    this.moveColor = moveColor;
    this.capturedColor = capturedColor;
    this.pieceWidth = pieceWidth;
    this.pieceHeigth = pieceHeigth;
    this.squareWhiteColor = squareWhiteColor;
    this.squareBlackColor = squareBlackColor;
    this.lastMovementData = null;
    this._images = null;
  }

  get boardWidth () {
    return this.pieceWidth * 8;
  }

  get boardHeigth () {
    return this.pieceHeigth * 8;
  }

  get canvas () {
    return this._canvas;
  }

  get ctx () {
    return this._ctx;
  }
  get images () {
    return this._images;
  }

  async init (pieces) {
    this._canvas = createCanvas(this.boardWidth, this.boardHeigth);
    this._ctx = this.canvas.getContext('2d');
    
    await this.loadPieceImages();
    this.render(pieces);
  }

  async loadPieceImages () {
    this._images = {
      blackBishop: await loadImage(path.join(__dirname, 'assets', 'bb.svg')),
      blackKing: await loadImage(path.join(__dirname, 'assets', 'bk.svg')),
      blackKnight: await loadImage(path.join(__dirname, 'assets', 'bn.svg')),
      blackPawn: await loadImage(path.join(__dirname, 'assets', 'bp.svg')),
      blackQueen: await loadImage(path.join(__dirname, 'assets', 'bq.svg')),
      blackRook: await loadImage(path.join(__dirname, 'assets', 'br.svg')),
      whiteBishop: await loadImage(path.join(__dirname, 'assets', 'wb.svg')),
      whiteKing: await loadImage(path.join(__dirname, 'assets', 'wk.svg')),
      whiteKnight: await loadImage(path.join(__dirname, 'assets', 'wn.svg')),
      whitePawn: await loadImage(path.join(__dirname, 'assets', 'wp.svg')),
      whiteQueen: await loadImage(path.join(__dirname, 'assets', 'wq.svg')),
      whiteRook: await loadImage(path.join(__dirname, 'assets', 'wr.svg')),
    }
  }

  drawBoard () {
    let row = 0;
    let column = 0;
    for (let i = 0; i < 64; i++) {
      if (i !== 0 && i % 8 === 0) {
        column += 1;
        row = 0;
      }
      const squareColor = this.getSquareColor(row, column);
      const squareX = row * this.pieceWidth;
      const squareY = column * this.pieceHeigth;
      this.drawSquare(squareColor, squareX, squareY)
      row += 1;
    }
  }

  getSquareColor (row, column) {
    return (column + row) % 2 ? this.squareWhiteColor : this.squareBlackColor;
  }

  drawSquare (color, x, y) {
    this._ctx.fillStyle = color;
    this._ctx.fillRect(x, y, this.pieceWidth, this.pieceHeigth);
  }

  drawPiece(pieceImage, x, y) {
    this._ctx.drawImage(
      pieceImage, 
      x,
      y,
      this.pieceWidth,
      this.pieceHeigth
    )
  }

  drawPieces (pieces) {
    for (const piece of pieces) {
      this.drawPiece(
        this.images[piece.name],
        this.getX(piece.column),
        this.getY(piece.row)
      )
    }
  }

  getX (column) {
    return (column - 1) * this.pieceWidth;
  }

  getY (row) {
    return (row - 1) * this.pieceHeigth;
  }

  drawNewMovement ({
    piece,
    startRow,
    startColumn,
    endRow,
    endColumn,
    captured = false
  }) {
    const color = captured ? this.capturedColor : this.moveColor;
    this.drawSquare(color, this.getX(startColumn), this.getY(startRow));
    this.drawSquare(color, this.getX(endColumn), this.getY(endRow));
    this.drawPiece(this.images[piece.name], this.getX(endColumn), this.getY(endRow));
  }

  cleanLastMovemnt () {
    if (!this.lastMovementData) return;

    const {
    piece,
    startRow,
    startColumn,
    endRow,
    endColumn,
    } = this.lastMovementData;

    this.drawSquare(
      this.getSquareColor(startRow, startColumn),
      this.getX(startColumn),
      this.getY(startRow));
    this.drawSquare(
      this.getSquareColor(endRow, endColumn),
      this.getX(endColumn),
      this.getY(endRow));
    this.drawPiece(
      this.getPieceImage(piece),
      this.getX(endColumn),
      this.getY(endRow));
  }

  drawMovement (movementData) {
    this.cleanLastMovemnt();
    this.drawNewMovement(movementData);
    this.lastMovementData = movementData;
  }

  render (pieces, lastMovementData) {
    this.drawBoard();
    this.drawPieces(pieces);
    if (lastMovementData) {
      this.drawNewMovement(lastMovementData);
    }
  }

  
}

module.exports = Canvas;