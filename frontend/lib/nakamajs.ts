// lib/nakamaSocket.ts
import { Client, Session, Socket, WebSocketAdapterText, MatchmakerMatched } from "@heroiclabs/nakama-js";

/** REST client singleton */
export const client = new Client(
  process.env.NEXT_PUBLIC_NAKAMA_SERVER_KEY ?? "defaultkey",
  "127.0.0.1",
  "7350",
  false,
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
  // reuse if already connected
  if (socketInstance && connected) return socketInstance;

  // if connect is in progress, await same promise
  if (connectingPromise) return connectingPromise;

  // otherwise create/connect and store promise
  connectingPromise = (async () => {
    // if socket already created but not connected, reuse it; else create new one
    const sock = socketInstance ?? client.createSocket(); // you can pass WebSocketAdapterText if needed

    // Attach handlers only once (assignment overwrites duplicates)
    sock.ondisconnect = () => {
      connected = false;
      // clear so next call will create a fresh socket
      socketInstance = null;
      connectingPromise = null;
    };

    // keep reference to prevent parallel creations
    socketInstance = sock;

    // ALWAYS call connect(), appearOnline just affects presence visibility
    await sock.connect(session, appearOnline);

    connected = true;
    connectingPromise = null;
    return sock;
  })();

  return connectingPromise;
}

/**
 * createSocketOnly - create a socket instance but DO NOT call connect().
 * Useful only if you want to prepare a socket and connect later.
 */
export function createSocketOnly(): Socket {
  if (!socketInstance) {
    socketInstance = client.createSocket();
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
  maxCount: number = 2,
) {
  // Ensure socket is created + connected
  const socket: Socket = await getSocket(session);

  // Join the Nakama matchmaker queue
  const ticket = await socket.addMatchmaker(
    query,
    minCount,
    maxCount,
  );

  return ticket; // { ticket: string }
}

export function subscribeMatchmakerMatched(
  socket: Socket,
  handler: (matched: MatchmakerMatched | any) => void
): () => void {
  // assign handler (overwrites previous handler) — prevents duplicate listeners
  socket.onmatchmakermatched = handler;

  // return unsubscribe function
  return () => {
    try {
      // only clear if it's still the same handler we set (safe guard)
      if ((socket as any).onmatchmakermatched === handler) {
        (socket as any).onmatchmakermatched = undefined;
      }
    } catch {
      // ignore
    }
  };
}

export async function subscribeMatchmakerMatchedWithSession(
  session: Session,
  handler: (matched: MatchmakerMatched | any) => void,
  appearOnline = true
): Promise<() => void> {
  const socket = await getSocket(session, appearOnline);

  // reuse the assignment approach to avoid adding duplicate listeners
  socket.onmatchmakermatched = handler;

  // return unsubscribe function
  return () => {
    try {
      if ((socket as any).onmatchmakermatched === handler) {
        (socket as any).onmatchmakermatched = undefined;
      }
    } catch {
      /* ignore */
    }
  };
}
