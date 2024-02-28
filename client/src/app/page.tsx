'use client';
import { useEffect, useMemo, useState } from 'react';
import { socket } from '../socket';
import { useRouter } from 'next/navigation';

import { useSearchParams } from 'next/navigation';

import Button from '@/components/Button';
import ProgressText from '@/components/ProgressText';
import { RedirectReason } from '@//types';

export default function Lobby() {

  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLookingForOpponent, setIsLookingForOpponent] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  useEffect(() => {

    const onJoinGame = (gameRoomUrl: string) => {
      router.push(`/${gameRoomUrl}`);
    }
    socket.connect();
    socket.on('joinGame', onJoinGame)
    return () => {
      socket.off('joinGame', onJoinGame);
      socket.disconnect();
    };
  }, [router]);

  useEffect(() => {

    const onSessionId = (sessionId: string) => {
      localStorage.setItem('sessionId', sessionId);
    }

    const sessionId = localStorage.getItem('sessionId');
    socket.auth = { sessionId };
    // no-op if the socket is already connected
    socket.connect();
    socket.on('sessionId', onSessionId);
    return () => {
      socket.off('sessionId', onSessionId);
      socket.disconnect();
    };
  }, []);

  const findMatch = () => {
    socket.emit('joinLobby', (response: boolean) => {
      setIsLookingForOpponent(response);
    });
  }

  const leaveLobby = () => {
    socket.emit('leaveLobby', () => {
      setIsLookingForOpponent(false);
    })
  }

  const redirectParam = searchParams.get('redirect');

  const warningMessage = useMemo(() => {
    if (!redirectParam) {
      return null;
    }
    let warningText = '';
    switch (redirectParam) {

      case RedirectReason.ROOMFULL: {
        warningText = 'The game you attempted to join is full.';
        break;
      }
      default:
      case RedirectReason.NOTFOUND: {
        warningText = 'Game not found';
        break;
      }
    }
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <span className="block sm:inline">{warningText}</span>
        <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setShowAlert(false)}>
          <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
        </span>
      </div>
    )
  }, [redirectParam])

  const buttons = useMemo(() => {
    if (isLookingForOpponent) {
      return (
        <>
          <div>
            <ProgressText>Looking for Match...</ProgressText>
          </div>
          <div>
            <Button
              onClick={leaveLobby}
              text="Cancel"
              color="red"
            />
          </div>
        </>
      )
    } else {
      return (
        <div>
          <Button
            onClick={findMatch}
            text='Find A Match!'
          />
        </div>
      )
    }
  }, [isLookingForOpponent]);

  return (
    <div className="flex flex-grow flex-col items-center justify-between">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        {showAlert ? warningMessage : null}
        <h1 className="text-6xl">Tic Tac Go!</h1>
        <h3>Your Favorite Way to Play Tic-Tac-Toe Online</h3>
      </div>
      {buttons}
    </div>
  );
}
