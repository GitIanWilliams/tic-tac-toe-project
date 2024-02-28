import { TPiece, Move } from '@//types';

export default function Piece({ piece }: { piece: TPiece}) {

  const pieceColor = piece === Move.X ? 'text-orange-600' : 'text-purple-600'
  return (
    <span className={pieceColor}>{piece}</span>
  );
}