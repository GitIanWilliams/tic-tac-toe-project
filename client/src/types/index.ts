export enum GameStatus {
  JOINING = 'JOINING',
  WAITING = 'WAITING',
  INPLAY = 'INPLAY',
  OVER = 'OVER',
}

export enum Move {
  X = 'X',
  O = 'O',
  Blank = '',
}

export type TPiece = Move.X | Move.O;

export type TTimers = {
  [Move.X]: number;
  [Move.O]: number;
};

export type TPlayerMoveMsg = {
  board: Move[];
  gameRoom: string;
  currentTurn: TPiece;
  timers: TTimers;
};

export type TTimedOutMsg = {
  currentTurn: TPiece;
  gameRoom: string;
};

export enum RedirectReason {
  NOTFOUND = 'notFound',
  ROOMFULL = 'roomFull',
}

export type TRedirect = {
  shouldRedirect: boolean;
  reason: RedirectReason;
};
export type TSuccessfulJoinResponse = {
  board?: Move[];
  currentTurn?: TPiece;
  timers?: TTimers;
  isReady: boolean;
  piece?: TPiece;
};
export type TJoinResponse = TSuccessfulJoinResponse | TRedirect;
