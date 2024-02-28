import { GameStatus, Move } from "@//types";
import Piece from './Piece';

type TBoardProps = {
  board: Move[];
  myTurn: boolean;
  sendMove: (cellIndex: number) => void;
  status: GameStatus;
}

const cellStyles = 'bg-black text-white aspect-square  flex items-center justify-center text-6xl';

export default function Board({ board, sendMove, myTurn, status}: TBoardProps) {
  const opacity = status === GameStatus.INPLAY ? 'bg-opacity-100' : 'bg-opacity-25';

  const boardContainerStyle = `bg-gray-100 grid grid-rows-3 grid-cols-3 gap-1 h-72 w-72 transition-opacity ${opacity}`;
  return (
    <div id="tic-tac-toe-board" className={boardContainerStyle}>
      {board.map((cell, cellIndex) => {
        return <div className={`${cellStyles} ${cell === Move.Blank && myTurn ? 'cursor-pointer' : 'cursor-default'}`} key={cellIndex} onClick={() => sendMove(cellIndex)}>
          {cell !== Move.Blank ? <Piece piece={cell} /> : null}
        </div>
      })}
    </div>
  )
}