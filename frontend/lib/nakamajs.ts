// lib/nakamaSocket.ts
import { Client, Session, Socket, WebSocketAdapterText, MatchmakerMatched } from "@heroiclabs/nakama-js";

/** runtime config derived from env */
const useSSL = (process.env.NEXT_PUBLIC_NAKAMA_SSL === "true");
const port = Number(
  process.env.NEXT_PUBLIC_NAKAMA_PORT ??
    (useSSL ? 443 : 7350)
);

export const client = new Client(
  process.env.NEXT_PUBLIC_NAKAMA_SERVER_KEY ?? "defaultkey",
  process.env.NEXT_PUBLIC_NAKAMA_HOST ?? "127.0.0.1",
  String(port),
  useSSL,
  10000
);

/** Module-scoped single socket + helpers */
let socketInstance: Socket | null = null;
let connectingPromise: Promise<Socket> | null = null;
let connected = false;

export function isConnected(): boolean {
  return Boolean(socketInstance && connected);
}

/**
 * getSocket - returns a connected socket, creating/connecting only if needed.
 * If a connection is already in-flight, reuses the same promise.
 */
export async function getSocket(session: Session, appearOnline = true): Promise<Socket> {
  if (!session || !session.token) {
    throw new Error("Invalid Nakama session passed to getSocket");
  }

  // reuse if already connected
  if (socketInstance && connected) return socketInstance;

  // if connect is in progress, await same promise
  if (connectingPromise) return connectingPromise;

  // otherwise create/connect and store promise
  connectingPromise = (async () => {
    // Use WebSocketAdapterText and pass useSSL so the resulting URL is wss:// when appropriate.
    const adapter = new WebSocketAdapterText();
    const sock = socketInstance ?? client.createSocket(useSSL, true, adapter);

    // Attach handlers - ensure ondisconnect clears state
    sock.ondisconnect = () => {
      connected = false;
      socketInstance = null;
      connectingPromise = null;
      // small debug
      try { console.info("[nakamaSocket] disconnected"); } catch {}
    };

    // keep reference to prevent parallel creations
    socketInstance = sock;

    try {
      // Debug: print what we're about to do (safe info)
      try {
        console.info("[nakamaSocket] connecting", {
          host: process.env.NEXT_PUBLIC_NAKAMA_HOST,
          port,
          useSSL,
          appearOnline,
          userId: (session as Session).user_id ?? "(unknown)",
        });
      } catch {}

      // ALWAYS call connect(), appearOnline just affects presence visibility
      await sock.connect(session, appearOnline);

      connected = true;
      // clear connectingPromise here so future callers don't await stale promise
      connectingPromise = null;
      try { console.info("[nakamaSocket] connected"); } catch {}
      return sock;
    } catch (err) {
      // clear stale state so next call can retry
      socketInstance = null;
      connectingPromise = null;
      connected = false;
      // rethrow so callers know it failed
      throw err;
    }
  })();

  return connectingPromise;
}

/**
 * createSocketOnly - create a socket instance but DO NOT call connect().
 * Useful only if you want to prepare a socket and connect later.
 */
export function createSocketOnly(): Socket {
  if (!socketInstance) {
    const adapter = new WebSocketAdapterText();
    socketInstance = client.createSocket(useSSL, true, adapter);
  }
  return socketInstance;
}

export function closeSocket(): void {
  if (socketInstance) {
    try {
      socketInstance.disconnect(true);
    } catch (_e) {}
  }
  socketInstance = null;
  connectingPromise = null;
  connected = false;
}

export function currentSocket(): Socket | null {
  return socketInstance;
}

/**
 * addToMatchmaker - ensures socket is connected and joins matchmaker queue.
 *
 * @param session       Nakama Session
 * @param query         Matchmaker query expression
 * @param minCount      Minimum number of players required
 * @param maxCount      Maximum number of players allowed
 */
export async function addToMatchmaker(
  session: Session,
  query: string = "*",
  minCount: number = 2,
  maxCount: number = 2
) {
  const socket: Socket = await getSocket(session);
  const ticket = await socket.addMatchmaker(query, minCount, maxCount);
  return ticket; // { ticket: string }
}

type MatchmakingSocket = Socket & {
  onmatchmakermatched?: (matched: MatchmakerMatched) => void;
};

export function subscribeMatchmakerMatched(
  socket: Socket,
  handler: (matched: MatchmakerMatched) => void
): () => void {
  const mmSocket = socket as MatchmakingSocket;
  mmSocket.onmatchmakermatched = handler;
  return () => {
    try {
      if (mmSocket.onmatchmakermatched === handler) {
        mmSocket.onmatchmakermatched = () => {};
      }
    } catch {
      // ignore
    }
  };
}

export async function subscribeMatchmakerMatchedWithSession(
  session: Session,
  handler: (matched: MatchmakerMatched) => void,
  appearOnline = true
): Promise<() => void> {
  const socket = (await getSocket(session, appearOnline)) as MatchmakingSocket;
  socket.onmatchmakermatched = handler;
  return () => {
    try {
      if (socket.onmatchmakermatched === handler) {
        socket.onmatchmakermatched = () => {};
      }
    } catch {
      // ignore
    }
  };
}
