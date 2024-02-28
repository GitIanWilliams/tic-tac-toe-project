import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { crc32 } from 'crc';
import { randomUUID } from 'crypto';
import { Server, Socket } from 'socket.io';
import { GameGateway } from '../game/game.gateway';
import { Move } from 'src/types';

type TLobbyMember = {
  socket: Socket;
  joined: number;
};

type TLobby = TLobbyMember[];
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MatchmakerGateway {
  constructor(private gameGateway: GameGateway) {}
  lobby: TLobby = [];
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinLobby')
  async joinLobby(@ConnectedSocket() socket: Socket): Promise<boolean> {
    if (!socket.handshake.auth.sessionId) {
      socket.handshake.auth.sessionId = randomUUID();
      socket.emit('sessionId', socket.handshake.auth.sessionId);
    }
    const { sessionId } = socket.handshake.auth;
    const alreadyInLobby = this.lobby.some(
      (member) => member.socket.handshake.auth.sessionId === sessionId,
    );
    if (!alreadyInLobby) {
      this.lobby.push({
        socket,
        joined: new Date().getTime(),
      });
    }
    this.lobby = await this.removeDeadLobbyMembers(this.lobby);
    if (this.lobby.length > 1) {
      const gameRoomUuid = randomUUID();
      const gameRoomUrl = crc32(gameRoomUuid).toString(16);
      const opponent = this.lobby.find(
        (member) => member.socket.handshake.auth !== sessionId,
      );
      this.server.in([socket.id, opponent.socket.id]).socketsJoin(gameRoomUrl);
      this.gameGateway.openGames[gameRoomUrl] = {
        currentTurn: Move.X,
        players: {
          [opponent.socket.handshake.auth.sessionId]: null,
          [sessionId]: null,
        },
        timers: {
          [Move.X]: 30,
          [Move.O]: 30,
        },
        board: [
          Move.Blank,
          Move.Blank,
          Move.Blank,
          Move.Blank,
          Move.Blank,
          Move.Blank,
          Move.Blank,
          Move.Blank,
          Move.Blank,
        ],
        lastUpdated: new Date(),
      };
      this.server.to(gameRoomUrl).emit('joinGame', gameRoomUrl);
      this.lobby = this.lobby.filter((lobbyMember) => {
        return ![socket.id, opponent.socket.id].includes(lobbyMember.socket.id);
      });
    }
    return true;
  }

  @SubscribeMessage('leaveLobby')
  leaveLobby(@ConnectedSocket() socket: Socket): boolean {
    const { sessionId } = socket.handshake.auth;
    const lobbyIndex = this.lobby.findIndex(
      (member) => member.socket.handshake.auth.sessionId === sessionId,
    );
    if (lobbyIndex > -1) {
      this.lobby = [
        ...this.lobby.slice(0, lobbyIndex),
        ...this.lobby.slice(lobbyIndex + 1),
      ];
    }
    return true;
  }

  async removeDeadLobbyMembers(lobby: TLobby) {
    const liveSockets = await this.server.fetchSockets();
    return lobby.filter((lobbyMember) => {
      return liveSockets.some((socket) => socket.id === lobbyMember.socket.id);
    });
  }
}
