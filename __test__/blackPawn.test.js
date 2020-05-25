const Board = require('../src/utils/Board');
const Piece = require('../src/utils/Piece');
const { SideType, PieceType } = require('../src/utils/constants');
const Movement = require('../src/Movement');

test('if the Black Pawn can move 2 squares on first move', () => {
  const board = new Board();
  const blackPawn = new Piece(PieceType.PAWN, SideType.BLACK, 8, 1);
  expect(blackPawn.getMovement(board)).toEqual([
    Movement.createSquareData({
      row: blackPawn.row - 1,
      column: blackPawn.column,
      side: blackPawn.side,
      piece: null,
      capture: false,
    }),
    Movement.createSquareData({
      row: blackPawn.row - 2,
      column: blackPawn.column,
      side: blackPawn.side,
      piece: null,
      capture: false,
    })
  ])
});

test('if the Black Pawn can move only 1 square', () => {
  const board = new Board();
  const blackPawn = new Piece(PieceType.PAWN, SideType.BLACK, 8, 1);
  blackPawn.isInitialPosition = false;
  expect(blackPawn.getMovement(board)).toEqual([
    Movement.createSquareData({
      row: blackPawn.row - 1,
      column: blackPawn.column,
      side: blackPawn.side,
      piece: null,
      capture: false,
    }),
  ])
});

test('if the Black Pawn can capture diagonal pieces', () => {
  const board = new Board();
  const blackPawn = new Piece(PieceType.PAWN, SideType.BLACK, 8, 2);
  const whitePawn = new Piece(PieceType.PAWN, SideType.WHITE, 7, 3);
  const whiteKnight = new Piece(PieceType.KNIGHT, SideType.WHITE, 7, 1);
  board.push(whitePawn);
  board.push(whiteKnight);
  expect(blackPawn.getMovement(board))
    .toEqual(
      expect.arrayContaining([
        Movement.createSquareData({
          row: blackPawn.row - 1,
          column: blackPawn.column,
          side: blackPawn.side,
          piece: null,
          capture: false,
        }),
        Movement.createSquareData({
          row: blackPawn.row - 2,
          column: blackPawn.column,
          side: blackPawn.side,
          piece: null,
          capture: false,
        }),
        Movement.createSquareData({
          row: whiteKnight.row,
          column: whiteKnight.column,
          side: blackPawn.side,
          piece: whiteKnight,
          capture: true,
        }),
        Movement.createSquareData({
          row: whitePawn.row,
          column: whitePawn.column,
          side: blackPawn.side,
          piece: whitePawn,
          capture: true,
        })
    ]))
});

test('if allied pieces blocks the Black Pawn', () => {
  const board = new Board();
  const blackPawn = new Piece(PieceType.PAWN, SideType.BLACK, 8, 1);
  board.push(new Piece(PieceType.KNIGHT, SideType.BLACK, 6, 1));
  expect(blackPawn.getMovement(board)).toEqual([
    Movement.createSquareData({
      row: blackPawn.row - 1,
      column: blackPawn.column,
      side: blackPawn.side,
      piece: null,
      capture: false,
    }),
  ])
  board.push(new Piece(PieceType.KNIGHT, SideType.BLACK, 7, 1));
  expect(blackPawn.getMovement(board)).toEqual([]);
})