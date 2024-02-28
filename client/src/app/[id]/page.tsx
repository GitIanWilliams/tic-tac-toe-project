'use client'

import { useCallback, useEffect, useState } from "react";
import { socket } from '../../socket';
import { useRouter } from "next/navigation";

import { GameStatus, Move, TPiece, TPlayerMoveMsg,  TJoinResponse, TTimedOutMsg, TTimers, TSuccessfulJoinResponse } from "@//types";

import Board from "@/components/Board";
import StatusReadout from "@/components/StatusReadout";
import Button from '@/components/Button';
import Timers from "@/components/Timers";
import { calculateWinner } from "@/utils";


const alternateTurn = (turn: TPiece) => turn === Move.X ? Move.O : Move.X;

export const baseBoard = [
  Move.Blank, Move.Blank, Move.Blank,
  Move.Blank, Move.Blank, Move.Blank,
  Move.Blank, Move.Blank, Move.Blank
];

export default function GameInstance({ params }: { params: { id: string } }) {
  const router = useRouter();

  const { id } = params;

  const [myPiece, setMyPiece] = useState<TPiece | null>(null);
  const [currentTurn, setCurrentTurn] = useState<TPiece>(Move.X);
  const [status, setStatus] = useState(GameStatus.JOINING);
  const [winner, setWinner] = useState(Move.Blank);
  const [board, setBoard] = useState(baseBoard);
  const [timers, setTimers] = useState<TTimers>({
    [Move.X]: 30,
    [Move.O]: 30
  });
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const sendMove = (cellIndex: number) => {
    if (status !== GameStatus.INPLAY || myPiece !== currentTurn) {
      return;
    }
    const newBoard = [
      ...board.slice(0, cellIndex),
      myPiece,
      ...board.slice(cellIndex + 1)
    ];
    const move: TPlayerMoveMsg = {
      board: newBoard,
      gameRoom: id,
      currentTurn: alternateTurn(myPiece),
      timers
    }
    if (timeoutId) {

      clearTimeout(timeoutId);
    }
    socket.emit('move', move);
  }

  const updateGameProgress = (newTurn: TPiece, newBoard: Move[]) => {
    setBoard(newBoard);
    setCurrentTurn(newTurn);
    const checkForWinner = calculateWinner(newBoard);
    if (checkForWinner) {
      setStatus(GameStatus.OVER);
      setWinner(checkForWinner);
    } else if (!newBoard.some((square) => square === Move.Blank)) {
      setStatus(GameStatus.OVER);
    } else {
      setStatus(GameStatus.INPLAY);
    }
  }

  const onGameReady = useCallback((response: TSuccessfulJoinResponse) => {
    if (!response.piece) {
      return;
    }
    setMyPiece(response.piece);
    if (response.board && response.currentTurn && response.timers) {
      const { board: newBoard, currentTurn: newTurn, timers: newTimers } = response;

      setTimers(newTimers);
      updateGameProgress(newTurn, newBoard);
    } else {
      setStatus(GameStatus.INPLAY);
    }
  }, [])

  // Update Timers
  useEffect(() => {
    if (status === GameStatus.INPLAY &&  !Object.values(timers).some((timeLeft) => timeLeft === 0)) {
      const newTimeoutId = setTimeout(() => {
        setTimers({
          ...timers,
          [currentTurn]: timers[currentTurn] - 1
        })
      }, 1000);
      setTimeoutId(newTimeoutId);
    }
  }, [status, currentTurn, timers]);

  useEffect(() => {
    if (timers[currentTurn] === 0 && status === GameStatus.INPLAY) {
      const timedOut: TTimedOutMsg = {
        currentTurn,
        gameRoom: id
      }
      socket.emit('timedOut', timedOut);
    }

  }, [status, timers, currentTurn, id])

  // Server connection
  useEffect(() => {

    const onPlayerJoin = (response: TJoinResponse) => {

      if ('shouldRedirect' in response) {
        router.push(`/?redirect=${response.reason}`);
        return;
      }
      if (response.isReady) {
        console.log('player join response', response);
        onGameReady(response);
      } else {
        setStatus(GameStatus.WAITING);
      }
    }

    const sessionId = localStorage.getItem('sessionId');
    socket.auth = { sessionId };
    socket.connect();
    socket.emit('join', id, onPlayerJoin);
    return () => {
      socket.disconnect();
    };
  }, [id, onGameReady, router]);

  // Responses to Server Emits
  useEffect(() => {

    const onMoveMade = (newBoard: Move[]) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const newTurn = alternateTurn(currentTurn);
      updateGameProgress(newTurn, newBoard);
    }

    const onGameOver = (timers: TTimers) => {
      setTimers(timers);
      const timedOutWinner = Object.keys(timers).find((piece) => timers[piece as TPiece] !== 0);
      if (timedOutWinner) {
        setWinner(timedOutWinner as Move);
      }
      setStatus(GameStatus.OVER);
    }

    socket.on('gameOver', onGameOver)
    socket.on('moveMade', onMoveMade);
    socket.on('gameReady', onGameReady)
    return () => {
      socket.off('move', onMoveMade);
      socket.off('gameReady', onGameReady);
      socket.on('gameOver', onGameOver);
    }
  }, [currentTurn, onGameReady, timeoutId]);

  return (
    <div className="w-full flex flex-col">
      <StatusReadout winner={winner} currentTurn={currentTurn} myPiece={myPiece} status={status} />

      <div className="flex justify-evenly p-24">
        <Board board={board} sendMove={sendMove} myTurn={myPiece === currentTurn} status={status} />
          <Timers status={status} currentTurn={currentTurn} timers={timers} />
      </div>
      {
        status === GameStatus.OVER ? (
          <div className="self-center">
            <Button text="Return to Lobby" onClick={() => router.push('/')} />
          </div>
        ) : null
      }
    </div>
  )
}