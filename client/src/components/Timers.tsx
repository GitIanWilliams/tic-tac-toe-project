import { GameStatus, TPiece, TTimers } from "@//types";
import Piece from "./Piece";

type TTimerProps = {
  currentTurn: TPiece;
  status: GameStatus;
  timers: TTimers;
}
export default function Timers({ timers, currentTurn, status}: TTimerProps) {
  if (status !== GameStatus.OVER && status !== GameStatus.INPLAY) {
    return null;
  }
  return (<div className="flex flex-col">
    {
      Object.keys(timers).map(moveStr => {
        const move = moveStr as TPiece;
        const time = timers[move];
        const expiredStyle = time === 0 ? 'text-red-800' : '';
        const activeStyle = currentTurn === move && status === GameStatus.INPLAY ? 'animate-pulse' : '';

        return <span key={move} className={[activeStyle, expiredStyle].join(' ')}><Piece piece={move} />  0:{String(timers[move as TPiece]).padStart(2, '0')}</span>
      })
    }
  </div>
  );
}