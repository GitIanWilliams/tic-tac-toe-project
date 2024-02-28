/*
* @jest-environment node
*/
import { calculateWinner } from '@/utils';
import { baseBoard } from '@/app/[id]/page';
import { Move } from '@//types';


const fillInMoves = (piece: Move) => (moveIndices: number[], board: Move[]) => {
  return board.map((value, idx) => (
    moveIndices.includes(idx) ? piece : value
  ))
}
const fillInX = fillInMoves(Move.X);
const fillInO = fillInMoves(Move.O);
describe('calculateWinner', () => {
  test('there is no winner on an empty board', () => {
    expect(calculateWinner(baseBoard)).toBeFalsy();
  });
  test('there is a winner if X claims the top row', () => {
    const boardWithAcrossWin = fillInX([0, 1, 2], baseBoard);
    expect(calculateWinner(boardWithAcrossWin)).toBeTruthy();
  });
  test('there is a winner if O claims a diagonal', () => {
    const boardWithDiagonalWin = fillInO([0, 4, 8], baseBoard);
    expect(calculateWinner(boardWithDiagonalWin)).toBeTruthy();
  });
  test('there is a winner if X claims a down', () => {
    const boardWithDownWin = fillInX([2, 5, 8], baseBoard);
    expect(calculateWinner(boardWithDownWin)).toBeTruthy();
  });
  test('there is no winner if X and O block each other', () => {
    const boardWithXs = fillInX([0, 2, 5, 6, 7], baseBoard);
    const boardWithXandOs = fillInO([1, 3, 4, 8], boardWithXs)
    expect(calculateWinner(boardWithXandOs)).toBeFalsy();
  });
});