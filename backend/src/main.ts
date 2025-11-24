
// const matchInit = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, params: {[key: string]: string}): {state: nkruntime.MatchState, tickRate: number, label: string} {
//   return {
//     state: { presences: {}, emptyTicks: 0 },
//     tickRate: 1, // 1 tick per second = 1 MatchLoop func invocations per second
//     label: ''
//   };
// };

interface LobbyMatchParams {
  invited?: string;
  roomName?: string;
  roomDescription?: string;
}

function makeEmptyBoard(): ("X" | "O" | null)[] {
  const board: ("X" | "O" | null)[] = [];
  for (let i = 0; i < 9; i += 1) {
    board.push(null);
  }
  return board;
}

const matchInit = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, params: LobbyMatchParams) {
  const state: nkruntime.MatchState & {
    presences: { [sessionId: string]: nkruntime.Presence };
    emptyTicks: number;
    board: ( "X" | "O" | null )[];
    currentTurn: "X" | "O";
    winner: "X" | "O" | "draw" | null;
    symbols: { [userId: string]: "X" | "O" };
  } = {
    presences: {},
    emptyTicks: 0,
    board: makeEmptyBoard(),
    currentTurn: "X",
    winner: null,
    symbols: {},
  };

  const labelObj = {
    roomName: params.roomName ?? null,
    roomDescription: params.roomDescription ?? null,
  };

  return {
    state,
    tickRate: 1,
    label: JSON.stringify(labelObj),
  };
};

const matchJoinAttempt = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presence: nkruntime.Presence, metadata: {[key: string]: any }) : {state: nkruntime.MatchState, accept: boolean, rejectMessage?: string | undefined } | null {
	logger.debug('%q attempted to join Lobby match', ctx.userId);
  
	return {
	  state,
	  accept: true
	};
};

const matchJoin = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presences: nkruntime.Presence[]): { state: nkruntime.MatchState } | null {
  presences.forEach(function (p) { 
    state.presences[p.sessionId] = p;

    // Assign symbol based on join order: first player gets "O", second gets "X".
    if (!state.symbols[p.userId]) {
        const existingSymbols = Object.keys(state.symbols).map(
        (userId) => state.symbols[userId]
    );
        if (existingSymbols.length === 0) {
        state.symbols[p.userId] = "O";
      } else if (existingSymbols.length === 1) {
        state.symbols[p.userId] = existingSymbols[0] === "O" ? "X" : "O";
      }
    }
  });

  const presenceList = Object.keys(state.presences).map(function (k) {
    return state.presences[k];
  });

  if (presenceList.length > 0) {
    const snapshot = JSON.stringify({
      board: (state as any).board,
      currentTurn: (state as any).currentTurn,
      winner: (state as any).winner,
      symbols: (state as any).symbols || {},
      usernames: Object.keys(state.presences).reduce((acc: { [userId: string]: string }, sid) => {
        const p = (state as any).presences[sid] as nkruntime.Presence;
        if (p && p.userId) {
          acc[p.userId] = p.username;
        }
        return acc;
      }, {}),
    });

    dispatcher.broadcastMessage(
      OpCodes.BoardState,
      snapshot,
      presenceList,
      null,
      true
    );
  }

  return {
    state
  };
}

const matchLeave = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: nkruntime.MatchState,
  presences: nkruntime.Presence[]
): { state: nkruntime.MatchState } | null {
  presences.forEach(function (p) {
    delete (state.presences[p.sessionId]);
  });

  // Remaining players after this leave
  const remainingPresences = Object.keys(state.presences).map(function (k) {
    return state.presences[k] as nkruntime.Presence;
  });

  // If game not finished yet and exactly one player remains, declare them winner.
  if (!state.winner && remainingPresences.length === 1) {
    const remaining = remainingPresences[0];
    const symbols = (state as any).symbols as { [userId: string]: "X" | "O" };
    const remainingSymbol = symbols ? symbols[remaining.userId] : null;

    if (remainingSymbol === "X" || remainingSymbol === "O") {
      state.winner = remainingSymbol;
    } else {
      // Fallback if we somehow can't find their symbol.
      state.winner = "draw";
    }

    const snapshot = JSON.stringify({
      board: (state as any).board,
      currentTurn: (state as any).currentTurn,
      winner: (state as any).winner,
      symbols: (state as any).symbols || {},
      usernames: remainingPresences.reduce(
        (acc: { [userId: string]: string }, p) => {
          if (p && p.userId) {
            acc[p.userId] = p.username;
          }
          return acc;
        },
        {}
      ),
    });

    dispatcher.broadcastMessage(
      OpCodes.BoardState,
      snapshot,
      remainingPresences,
      null,
      true
    );
  }

  return { state };
}

const OpCodes = {
  Move: 1,
  BoardState: 2, // (used only for broadcasting)
  SyncState: 3,
} as const;

function calculateWinner(board: ("X" | "O" | null)[]): "X" | "O" | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

const matchLoop = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, messages: nkruntime.MatchMessage[]) {
  // end‑match logic as you have it...
  // process messages from clients
  for (const msg of messages) {
    const opCode = msg.opCode;

    if (opCode === OpCodes.SyncState) {
      const snapshotSync = JSON.stringify({
        board: (state as any).board,
        currentTurn: (state as any).currentTurn,
        winner: (state as any).winner,
        symbols: (state as any).symbols || {},
        usernames: Object.keys((state as any).presences || {}).reduce((acc: { [userId: string]: string }, sid) => {
          const p = (state as any).presences[sid] as nkruntime.Presence;
          if (p && p.userId) {
            acc[p.userId] = p.username;
          }
          return acc;
        }, {}),
      });

      dispatcher.broadcastMessage(
        OpCodes.BoardState,
        snapshotSync,
        [msg.sender],
        null,
        true
      );
    } else if (opCode === OpCodes.Move) {
      // payload: { index: number }
      let move;
      try {
        const json = nk.binaryToString(msg.data); // ArrayBuffer -> string
        move = JSON.parse(json) as { index: number };
      } catch (e) {
        logger.error("Invalid move payload: %v", e);
        continue;
      }

      const index = move.index;
      if (index < 0 || index > 8) continue;
      if (state.winner) continue;           // game already over
      if (state.board[index] !== null) continue;

      // Enforce server-side turn order and symbol mapping.
      const userId = msg.sender.userId;
      const symbols = (state as any).symbols as { [userId: string]: "X" | "O" };
      if (!symbols || !symbols[userId]) {
        // Player has no assigned symbol yet; ignore move.
        continue;
      }

      const symbol = symbols[userId];
      if (symbol !== (state as any).currentTurn) {
        // Not this player's turn; ignore move.
        continue;
      }

      state.board[index] = symbol;

      // Check winner & switch turn
      const winner = calculateWinner(state.board); // implement small helper
      if (winner) {
        state.winner = winner;
      } else if (state.board.every((c: "X" | "O" | null) => c !== null)) {
        state.winner = "draw";
      } else {
        state.currentTurn = state.currentTurn === "X" ? "O" : "X";
      }

      // Broadcast full board state snapshot to everyone
      const snapshot = JSON.stringify({
        board: state.board,
        currentTurn: state.currentTurn,
        winner: state.winner,
        symbols: (state as any).symbols || {},
        usernames: Object.keys(state.presences).reduce((acc: { [userId: string]: string }, sid) => {
          const p = (state as any).presences[sid] as nkruntime.Presence;
          if (p && p.userId) {
            acc[p.userId] = p.username;
          }
          return acc;
        }, {}),
      });

      const presences = Object.keys(state.presences).map(
        (k) => state.presences[k]
       );

      dispatcher.broadcastMessage(
        OpCodes.BoardState,
        snapshot,
        presences, // all players
        null,
        true    // reliable
      );
    }
  }

  const presenceCount = Object.keys((state as any).presences || {}).length;

  if (presenceCount === 0) {
    // Increment emptyTicks while no one is in the match.
    (state as any).emptyTicks = ((state as any).emptyTicks ?? 0) + 1;

    // With tickRate = 1, 30 ticks ≈ 30 seconds.
    if ((state as any).emptyTicks >= 30) {
      logger.debug("Terminating lobby match after being empty for 30 ticks");
      // Returning null signals Nakama to terminate and clean up this match.
      return null;
    }
  } else {
    // Reset once someone is present again.
    (state as any).emptyTicks = 0;
  }

  return { state };
};

const matchSignal = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, data: string) : { state: nkruntime.MatchState, data?: string } | null {
	logger.debug('Lobby match signal received: ' + data);
  
	return {
	  state,
	  data: "Lobby match signal received: " + data
	};
}

const matchTerminate = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, graceSeconds: number) : { state: nkruntime.MatchState} | null {
	logger.debug('Lobby match terminated');
  
	return {
	  state
	};
}

const beforeMatchmakerAdd : nkruntime.RtBeforeHookFunction<nkruntime.EnvelopeMatchmakerAdd> = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, envelope: nkruntime.EnvelopeMatchmakerAdd) : nkruntime.EnvelopeMatchmakerAdd | void {
  envelope.matchmakerAdd.minCount = 2
  envelope.matchmakerAdd.maxCount = 2
  envelope.matchmakerAdd.query = "*"

  return envelope;
}

// const onMatchmakerMatched : nkruntime.MatchmakerMatchedFunction = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, matches: nkruntime.MatchmakerResult[]): string | void {
//   const matchId = nk.matchCreate("lobby", { "invited": matches })
//   return matchId;
// }

function matchmakerMatched(context: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, matches: nkruntime.MatchmakerResult[]): string {
  matches.forEach(function (match) {
    logger.info("Matched user '%s' named '%s'", match.presence.userId, match.presence.username);

    Object.keys(match.properties).forEach(function (key) {
      logger.info("Matched on '%s' value '%v'", key, match.properties[key])
    });
  });

  try {
    const invited = matches.map((m) => {
        return {
        userId: m.presence?.userId ?? m.presence?.userId ?? null,
        username: m.presence?.username ?? null,
        sessionId: m.presence?.sessionId ?? m.presence?.sessionId ?? null,
        // Only include properties you control / know are serializable
        properties: m.properties ?? {}
        };
    });
    const invitedJson = JSON.stringify(invited);
    logger.info("Creating match with invited payload: %s", invitedJson);
    const matchId = nk.matchCreate("lobby", { invited: invitedJson });
    return matchId;
  } catch (err) {
    logger.error(String(err));
    throw (err);
  }
}

function createRoomRpc(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
 try {
    const body = payload ? JSON.parse(payload) as { roomName?: string; roomDescription?: string } : {};
    const params: LobbyMatchParams = {
        roomName: body.roomName,
        roomDescription: body.roomDescription,
    };
    const matchId = nk.matchCreate("lobby", params);
    logger.info("Created room match with id %s", matchId);
    return JSON.stringify({ matchId, roomName: body.roomName ?? null, roomDescription: body.roomDescription ?? null });
    } catch (err) {
    logger.error("createRoomRpc error: %v", err);
    throw err;
 }
}

function listRoomsRpc(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
  try {
    const limit = 50;
    const isAuthoritative = true;
    const minSize = 1;
    const maxSize = 1;

    // label = null, query = ""  → no extra filters, just size=1 authoritative matches
    const matches = nk.matchList(limit, isAuthoritative, null, minSize, maxSize, "");

    logger.info("listRoomsRpc: found %d matches", matches.length);

    const rooms = matches.map(function (m) {
      let roomName: string | null = null;
      let roomDescription: string | null = null;

      if (m.label) {
        try {
          const parsed = JSON.parse(m.label) as {
            roomName?: string | null;
            roomDescription?: string | null;
          };
          roomName = parsed.roomName || null;
          roomDescription = parsed.roomDescription || null;
        } catch (e) {
          logger.error("Failed to parse match label for match %s: %v", m.matchId, e);
        }
      }

      return {
        matchId: m.matchId,
        roomName,
        roomDescription,
        size: m.size,
        maxSize: 2, // you want a 1v1 game
      };
    });

    logger.info("listRoomsRpc: returning %d rooms", rooms.length);
    return JSON.stringify({ rooms });
  } catch (err) {
    logger.error("listRoomsRpc error: %v", err);
    throw err;
  }
}

let InitModule: nkruntime.InitModule = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
  initializer.registerRtBefore("MatchmakerAdd", beforeMatchmakerAdd)
  initializer.registerMatchmakerMatched(matchmakerMatched)
  initializer.registerRpc("create_room", createRoomRpc)
  initializer.registerRpc("list_rooms", listRoomsRpc)
  initializer.registerMatch('lobby', {
    matchInit,
    matchJoinAttempt,
    matchJoin,
    matchLeave,
    matchLoop,
    matchSignal,
    matchTerminate
  });
  logger.info("Hello World !!!")
}
