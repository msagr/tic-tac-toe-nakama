"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/lib/hook/UserContext";
import { WaitingLobby } from "@/components/WaitingLobby";
import { getSocket } from "@/lib/nakamajs";
import type { Session, Socket, MatchmakerMatched } from "@heroiclabs/nakama-js";
import { useRouter } from "next/navigation";

export default function WaitingPage() {
  const { user } = useUser();
  const [opponentName, setOpponentName] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Searching for an opponent...");
  const [countdown, setCountdown] = useState<number | null>(null); 
  const [matchId, setMatchId] = useState<string | null>(null);
  const router = useRouter();

  const selfName: string = user?.username ?? "You";

  // small retry helper for joinMatch - avoids tiny race windows
  async function tryJoin(socket: Socket, id: string, attempts = 3): Promise<void> {
    for (let index = 0; index < attempts; index += 1) {
      try {
        await socket.joinMatch(id);
        return;
      } catch (error) {
        const message = String(
          (error as Error)?.message ?? JSON.stringify(error)
        ).toLowerCase();

        if (message.includes("invalid match id") || message.includes("invalid match")) {
          throw error;
        }

        // exponential-ish backoff
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 150 * (index + 1)));
      }
    }

    throw new Error("joinMatch failed after retries");
  }

    useEffect(() => {
        if (countdown === null) return;

        if (countdown === 0) {
            router.push(`/multiplayer/game?opponent=${encodeURIComponent(opponentName as string)}&matchId=${encodeURIComponent(matchId as string)}`)  // ⬅ target route
            return;
        }

        const id = setTimeout(() => {
            setCountdown((prev) => (prev === null ? null : prev - 1));
        }, 1000);

        return () => clearTimeout(id);
    }, [countdown, router, matchId, opponentName]);

  useEffect(() => {
    if (!user) {
      console.log("You must be logged in to use matchmaking.");
      return;
    }

    let cancelled = false;
    let localSocket: Socket | null = null;

    (async () => {
      try {
        const socket = await getSocket(user as Session, true);
        if (cancelled) return;

        localSocket = socket;
        setStatus("Searching for an opponent...");

        socket.onmatchmakermatched = async (matched: MatchmakerMatched): Promise<void> => {
          if (cancelled) return;

          console.log("MatchmakerMatched payload:", matched);

          const matchId = matched.match_id;
          if (!matchId) {
            console.warn("No match_id in authoritave matchmaker result:", matched);
            setStatus("Match found but missing match ID.");
            return;
          }

          setStatus("Opponent found! Joining match...");
          setMatchId(matchId);

          const opponent = matched.users.find(
            (entry) => entry.presence.user_id !== user.user_id
          );

          if (opponent) {
            setOpponentName(opponent.presence.username);
          }

          try {
            await tryJoin(socket, matchId);
            setStatus("Match confirmed! Preparing your game...");
            setCountdown(3);
            // At this point you could navigate to /multiplayer/game or similar.
          } catch (error) {
            console.error("Failed to join authoritative match:", error);
            setStatus(`Failed to join match: ${String(error)}`);
          }
        };
      } catch (error) {
        if (!cancelled) {
          console.error("Error initializing waiting room socket:", error);
          setStatus(`Error initializing matchmaking: ${String(error)}`);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (localSocket) {
        // Clean up handler when leaving waiting room
        localSocket.onmatchmakermatched = () => {};
      }
    };
  }, [user]);

  return (
    <WaitingLobby
      selfName={selfName}
      opponentName={opponentName}
      // if WaitingLobby doesn't accept status, you can ignore this or extend props
      status={status}
    />
  );
}
