import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import {
  Move,
  RedirectReason,
  TPiece,
  TPlayerMoveMsg,
  TTimers,
  TTimedOutMsg,
  TJoinResponse,
} from '../types';

type TGame = {
  players: {
    [sessionId: string]: TPiece;
  };
  board?: Move[];
  currentTurn?: TPiece;
  lastUpdated: Date;
  timers?: TTimers;
};

type TOpenGames = {
  [gameId: string]: TGame;
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway {
  openGames: TOpenGames = {};
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('move')
  makeMove(@MessageBody() playerMove: TPlayerMoveMsg) {
    const { board, currentTurn, gameRoom, timers } = playerMove;
    this.server.to(gameRoom).emit('moveMade', board);

    this.openGames[gameRoom] = {
      ...this.openGames[gameRoom],
      board,
      currentTurn,
      timers,
      lastUpdated: new Date(),
    };
  }

  @SubscribeMessage('timedOut')
  gameTimedOut(@MessageBody() timedOut: TTimedOutMsg) {
    const { currentTurn, gameRoom } = timedOut;
    this.openGames[gameRoom] = {
      ...this.openGames[gameRoom],
      timers: {
        ...this.openGames[gameRoom]?.timers,
        [currentTurn]: 0,
      },
      lastUpdated: new Date(),
    };
    this.server.to(gameRoom).emit('gameOver', this.openGames[gameRoom].timers);
  }

  @SubscribeMessage('join')
  async playerJoined(
    @MessageBody() gameRoom: string,
    @ConnectedSocket() socket: Socket,
  ): Promise<TJoinResponse> {
    const { sessionId } = socket.handshake.auth;
    const roomExists = this.openGames[gameRoom];
    if (!roomExists) {
      return {
        shouldRedirect: true,
        reason: RedirectReason.NOTFOUND,
      };
    }
    const playerSessions = Object.keys(this.openGames[gameRoom]?.players || {});
    if (!playerSessions.includes(sessionId)) {
      return {
        shouldRedirect: true,
        reason: RedirectReason.ROOMFULL,
      };
    }
    // user closed browser window and reopened
    if (!socket.rooms.has(gameRoom)) {
      socket.join(gameRoom);
    }

    // Tell user where they left off
    if (this.openGames[gameRoom]?.players[sessionId]) {
      const gameStatus = this.openGames[gameRoom];
      const { board, currentTurn, players, timers } = gameStatus;
      if (currentTurn === players[sessionId] && timers) {
        timers[currentTurn] = this.getNewTimerValue(gameStatus);
      }
      return {
        isReady: true,
        piece: players[sessionId],
        board,
        currentTurn,
        timers,
      };
    }
    const playersInGame = Object.keys(this.openGames[gameRoom].players);
    if (playersInGame.length === 2) {
      const myPiece = Math.random() > 0.5 ? Move.X : Move.O;
      const theirPiece = myPiece === Move.X ? Move.O : Move.X;
      playersInGame.forEach((playerSessionId) => {
        this.openGames[gameRoom].players[playerSessionId] =
          playerSessionId === sessionId ? myPiece : theirPiece;
      });
      socket.to(gameRoom).emit('gameReady', {
        piece: theirPiece,
      });
      return {
        isReady: true,
        piece: myPiece,
      };
    } else {
      return {
        isReady: false,
      };
    }
  }

  getNewTimerValue({ currentTurn, lastUpdated, timers }: TGame) {
    const currentTime = new Date().getTime();
    const lastUpdatedTime = lastUpdated.getTime();
    const timeDiff = Math.floor((currentTime - lastUpdatedTime) / 1000);
    const updatedTimer = Math.max(timers[currentTurn] - timeDiff, 0);
    return updatedTimer;
  }
}
