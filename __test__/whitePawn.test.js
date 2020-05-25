const Board = require('../src/utils/Board');
const Piece = require('../src/utils/Piece');
const { SideType, PieceType } = require('../src/utils/constants');
const Movement = require('../src/Movement');

test('if the White Pawn can move 2 squares on first move', () => {
  const board = new Board();
  const whitePawn = new Piece(PieceType.PAWN, SideType.WHITE, 1, 1);
  expect(whitePawn.getMovement(board)).toEqual([
    Movement.createSquareData({
      row: whitePawn.row + 1,
      column: whitePawn.column,
      side: whitePawn.side,
      piece: null,
      capture: false,
    }),
    Movement.createSquareData({
      row: whitePawn.row + 2,
      column: whitePawn.column,
      side: whitePawn.side,
      piece: null,
      capture: false,
    })
  ])
});

test('if the White Pawn can move only 1 square', () => {
  const board = new Board();
  const whitePawn = new Piece(PieceType.PAWN, SideType.WHITE, 1, 1);
  whitePawn.isInitialPosition = false;
  expect(whitePawn.getMovement(board)).toEqual([
    Movement.createSquareData({
      row: whitePawn.row + 1,
      column: whitePawn.column,
      side: whitePawn.side,
      piece: null,
      capture: false,
    }),
  ])
});

test('if the White Pawn can capture diagonal pieces', () => {
  const board = new Board();
  const whitePawn = new Piece(PieceType.PAWN, SideType.WHITE, 1, 2);
  const blackPawn = new Piece(PieceType.PAWN, SideType.BLACK, 2, 3);
  const blackKnight = new Piece(PieceType.KNIGHT, SideType.BLACK, 2, 1);
  board.push(blackPawn);
  board.push(blackKnight);
  expect(whitePawn.getMovement(board))
    .toEqual(
      expect.arrayContaining([
        Movement.createSquareData({
          row: whitePawn.row + 1,
          column: whitePawn.column,
          side: whitePawn.side,
          piece: null,
          capture: false,
        }),
        Movement.createSquareData({
          row: whitePawn.row + 2,
          column: whitePawn.column,
          side: whitePawn.side,
          piece: null,
          capture: false,
        }),
        Movement.createSquareData({
          row: blackKnight.row,
          column: blackKnight.column,
          side: whitePawn.side,
          piece: blackKnight,
          capture: true,
        }),
        Movement.createSquareData({
          row: blackPawn.row,
          column: blackPawn.column,
          side: whitePawn.side,
          piece: blackPawn,
          capture: true,
        })
    ]))
});

test('if allied pieces blocks the White Pawn', () => {
  const board = new Board();
  const whitePawn = new Piece(PieceType.PAWN, SideType.WHITE, 1, 1);
  board.push(new Piece(PieceType.KNIGHT, SideType.WHITE, 3, 1));
  expect(whitePawn.getMovement(board)).toEqual([
    Movement.createSquareData({
      row: whitePawn.row + 1,
      column: whitePawn.column,
      side: whitePawn.side,
      piece: null,
      capture: false,
    }),
  ])
  board.push(new Piece(PieceType.KNIGHT, SideType.WHITE, 2, 1));
  expect(whitePawn.getMovement(board)).toEqual([]);
})