import { useMemo } from "react";
import Piece from '@/components/Piece';
import ProgressText from '@/components/ProgressText';
import { GameStatus, Move, TPiece } from "@//types";


type TStatusReadoutProps = {
  status: GameStatus;
  myPiece: TPiece | null;
  winner?: Move;
  currentTurn: TPiece;
}

export default function StatusReadout({ status, myPiece, winner, currentTurn }: TStatusReadoutProps) {

  const statusText = useMemo(() => {
    switch (status) {
      case GameStatus.INPLAY: {
        return <h1>Current Turn: <Piece piece={currentTurn} /></h1>;
      }
      case GameStatus.OVER: {
        if (winner) {
          return winner === myPiece ? <h1>You won!</h1> : <h1><Piece piece={winner} /> has won.</h1>;
        } else {
          return <h1>The game has tied :/</h1>;
        }
      }
      default:
      case GameStatus.JOINING:
      case GameStatus.WAITING:
      {
        const statusText = status === GameStatus.WAITING ? 'Waiting for opponent...' : 'Joining...';
          return <ProgressText>{statusText}</ProgressText>;
      }
    }
  }, [status, currentTurn, myPiece, winner]);

  const playerInfo = myPiece ? <span id="my-piece">You are <Piece piece={myPiece} /></span> : '';

  return (
    <div>
      {playerInfo}
      {statusText}

    </div>
  );
}