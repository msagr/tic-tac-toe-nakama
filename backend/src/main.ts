
const matchInit = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, params: {[key: string]: string}): {state: nkruntime.MatchState, tickRate: number, label: string} {
  return {
    state: { presences: {}, emptyTicks: 0 },
    tickRate: 1, // 1 tick per second = 1 MatchLoop func invocations per second
    label: ''
  };
};

const matchJoinAttempt = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presence: nkruntime.Presence, metadata: {[key: string]: any }) : {state: nkruntime.MatchState, accept: boolean, rejectMessage?: string | undefined } | null {
	logger.debug('%q attempted to join Lobby match', ctx.userId);
  
	return {
	  state,
	  accept: true
	};
};

const matchJoin = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presences: nkruntime.Presence[]) : { state: nkruntime.MatchState } | null {
  presences.forEach(function (p) { 
    state.presences[p.sessionId] = p;
  });

  return {
    state
  };
}

const matchLeave = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presences: nkruntime.Presence[]) : { state: nkruntime.MatchState } | null {
  presences.forEach(function (p) {
    delete(state.presences[p.sessionId]);
  });

  return {
    state
  };
}

const matchLoop = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, messages: nkruntime.MatchMessage[]) : { state: nkruntime.MatchState} | null {
  // If we have no presences in the match according to the match state, increment the empty ticks count
  if (state.presences.length === 0) {
    state.emptyTicks++;
  }

  // If the match has been empty for more than 100 ticks, end the match by returning null
  if (state.emptyTicks > 100) {
    return null;
  }

  return {
    state
  };
}

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

let InitModule: nkruntime.InitModule = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
  initializer.registerRtBefore("MatchmakerAdd", beforeMatchmakerAdd)
  initializer.registerMatchmakerMatched(matchmakerMatched)
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