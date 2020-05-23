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
      captured: null,
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

  hasPiece (row, column) {
    return this.pieces.some(pieceData => 
      pieceData.row === row &&
      pieceData.column === column
    )
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
    this._drawLastMovement();
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

  
  _validateLastMovemnt () {
    if (
      !this.lastMovemnt.piece ||
      !this.lastMovemnt.startRow ||
      !this.lastMovemnt.startColumn ||
      !this.lastMovemnt.endRow ||
      !this.lastMovemnt.endColumn
      ) return false;
    return true;
  }

  _drawLastMovement() {
    const {
      piece,
      startRow,
      startColumn,
      endRow,
      endColumn,
      captured
    } = this.lastMovemnt;

    if (!this._validateLastMovemnt()) return;
    this._drawMovement(
      this._getPieceImage(piece),
      startRow,
      startColumn,
      endRow,
      endColumn,
      captured,
    )
  }

  _cleanLastMovemnt () {
    const {
      piece,
      startRow,
      startColumn,
      endRow,
      endColumn,
    } = this.lastMovemnt;

    if (!this._validateLastMovemnt()) return;

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
    const piece = this.findPiece(startRow, startColumn);
    if (!piece) {
      throw new Error(errors.squareEmply(startRow, startColumn));
    }
    const possibilities = this.getPossibilities(piece);
    
    const movement = possibilities.find(
      ({ row, column }) => row === endRow && column === endColumn
    );

    if (!movement) throw new Error(errors.invalidMovement);

    this.movePiece(
      piece.piece,
      startRow,
      startColumn,
      endRow,
      endColumn,
      this.turn,
      );
    
    this._cleanLastMovemnt();
    this._drawMovement(
      this._getPieceImage(piece.piece),
      startRow, startColumn, endRow, endColumn, movement.capture
    )
    
    this.lastMovemnt = {
      piece: piece.piece,
      startRow,
      startColumn,
      endRow,
      endColumn,
      captured: movement.capture,
    }

    this.turn = this.getNextTurn(this.turn);
  }

  getPossibilities ({ piece, row, column, isInitialPosition }) {
    const possibilities = [];
    const addPossib = (row, column, turn, capture) => {
      const x = this.pieces.find(pieceData => 
        pieceData.row === row &&
        pieceData.column === column
      )
      if (!x) return possibilities.push({ row, column })
      if (x.piece.startsWith(turn)) return;
      if (capture) return possibilities.push({ row, column, capture });
    }

    const knightPossib = (turn) => {
      // L TOP
      addPossib(row + 2, column + 1, turn, true);
      addPossib(row + 2, column - 1, turn, true);
      // L RIGHT
      addPossib(row - 1, column + 2, turn, true);
      addPossib(row + 1, column + 2, turn, true);
      // L LEFT
      addPossib(row - 1, column - 2, turn, true);
      addPossib(row + 1, column - 2, turn, true);
      // L BACK
      addPossib(row - 2, column - 1, turn, true);
      addPossib(row - 2, column + 1, turn, true);
    }

    const boardPossib = (turn, func) => {
      for (let i = 1; i <= 8; i++) {
        const [rookRow, rookColumn] = func(i);
        if (
          rookRow > 8 ||
          rookRow < 1 ||
          rookColumn > 8 ||
          rookColumn < 1
          ) return;
        const piece = this.pieces.find(
          d => d.row === rookRow && d.column === rookColumn
        )
        if (piece) {
          if (piece.piece.startsWith(turn)) return;
          addPossib(rookRow, rookColumn, turn, true);
          return;
        }
        addPossib(rookRow, rookColumn, turn, false);
      }
    }

    const rookPossib = turn => {
      boardPossib(turn, i => [row + i, column])
      boardPossib(turn, i => [row - i, column])
      boardPossib(turn, i => [row, column + i])
      boardPossib(turn, i => [row, column - i])
    }

    const bishopPossib = turn => {
      boardPossib(turn, i => [row + i, column + i])
      boardPossib(turn, i => [row - i, column + i])
      boardPossib(turn, i => [row + i, column - i])
      boardPossib(turn, i => [row - i, column - i])
    }

    switch (piece) {
      case 'whitePawn':
        addPossib(row + 1, column, 'white', false);
        addPossib(row + 1, column + 1, 'white', true);
        addPossib(row + 1, column - 1, 'white', true);
        if (isInitialPosition) {
          addPossib(row + 2, column, 'white', false)
        }
        break;
      case 'blackPawn':
        addPossib(row - 1, column, 'black', false);
        addPossib(row - 1, column - 1, 'black', true);
        addPossib(row - 1, column + 1, 'black', true);
        if (isInitialPosition) {
          addPossib(row - 2, column, 'black', false);
        }
        break;
      case 'blackKnight':
        knightPossib('black');
        break;
      case 'whiteKnight':
        knightPossib('white');
        break;
      case 'whiteRook':
        rookPossib('white');
        break;
      case 'blackRook':
        rookPossib('black');
        break;
      case 'blackBishop':
        bishopPossib('black');
        break;
      case 'whiteBishop':
        bishopPossib('white');
        break;
      default:
        break;
    }

    return possibilities
      .filter(c =>
        c.row <= 8 &&
        c.row >= 1 &&
        c.column <= 8 &&
        c.column >= 1
      )
  }
}

module.exports = ChessCanvas;