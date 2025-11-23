"use client";

import { useRef, useState, type FormEvent } from "react";
import styles from "../Landing.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { client, getSocket, createSocketOnly, addToMatchmaker } from "@/lib/nakamajs";
import { useUser } from "@/lib/hook/UserContext";
import { Session } from "@heroiclabs/nakama-js";
import React from "react";

export default function MultiplayerPage() {
  const [createRoomName, setCreateRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const { user, setUser, logout } = useUser();
  const handlerRef = useRef<((m: any) => void) | null>(null);

  function handleCreateRoom() {
    console.log('Create Room');
  }

  // small retry helper for joinMatch - avoids tiny race windows
  async function tryJoin(socket: any, id: string, attempts = 3) {
    for (let i = 0; i < attempts; i++) {
      try {
        await socket.joinMatch(id);
        return true;
      } catch (err: any) {
        const msg = String(err?.message ?? JSON.stringify(err)).toLowerCase();
        // If server explicitly says invalid match id, do not retry
        if (msg.includes("invalid match id") || msg.includes("invalid match")) {
          throw err;
        }
        // backoff and retry
        await new Promise((r) => setTimeout(r, 150 * (i + 1)));
      }
    }
    throw new Error("joinMatch failed after retries");
  }

  async function handleJoinRoom(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Preparing matchmaking...");

    if (!user) {
      console.log("Please login first.");
      return;
    }

    try {
      // 1) ensure socket is connected (singleton getSocket)
      const socket = await getSocket(user as Session, true);

      // 2) attach handler BEFORE calling addToMatchmaker to avoid race
      const handler = async (matched: any) => {
        console.log("MatchmakerMatched payload:", matched);
        // authoritative flow: prefer match_id
        const matchId = matched.match_id;
        if (!matchId) {
          console.warn("No match_id in result (authoritative flow expected).", matched);
          console.log("Match found but no match_id returned.");
          return;
        }

        console.log("Match found — joining...");

        try {
          await tryJoin(socket, matchId);
          console.log("Joined match: " + matchId);

          // attach match handlers now that we're joined
          socket.onmatchdata = (md: any) => {
            // handle incoming match state updates
            console.log("onmatchdata", md);
          };
          socket.onmatchpresence = (p: any) => {
            console.log("onmatchpresence", p);
          };

          // TODO: navigate to your in-game UI here

        } catch (joinErr) {
          console.error("Failed to join authoritative match:", joinErr);
          console.log("Failed to join match: " + String(joinErr));
        } finally {
          // remove this handler to avoid reacting to further matchmaker events
          try {
            if ((socket as any).onmatchmakermatched === handler) {
              (socket as any).onmatchmakermatched = undefined;
            }
          } catch {}
        }
      };

      // store ref so we can remove on unmount if needed
      handlerRef.current = handler;
      socket.onmatchmakermatched = handler;

      // 3) now add to matchmaker (this returns a ticket immediately)
      const ticket = await addToMatchmaker(user as Session, "*", 2, 2);
      console.log("submitted to matchmaker, ticket:", ticket);
      console.log("Searching for opponent... (ticket: " + (ticket?.ticket ?? "n/a") + ")");

      // waiting for onmatchmakermatched to fire...
    } catch (err) {
      console.error("Error starting matchmaking:", err);
      console.log("Matchmaking error: " + String(err));
    }
  }

  // cleanup: remove handler if component unmounts
  React.useEffect(() => {
    return () => {
      (async () => {
        try {
          if (!user) return;
          const socket = await getSocket(user, true);
          if (handlerRef.current && (socket as any).onmatchmakermatched === handlerRef.current) {
            (socket as any).onmatchmakermatched = undefined;
          }
        } catch { /* ignore */ }
      })();
    };
  }, [user]);

  return (
    <div className={styles.page}>
      <div className={styles.noise} />

      <main className={styles.shell}>
        <section className={styles.hero}>
            <div className={styles.brandBadge}>XOXO Multiplayer</div>
            <h1 className={styles.title}>
                Set up your <span className={styles.highlight}>multiplayer</span> match.
            </h1>
            <p className={styles.subtitle}>
                Create a new room and share the code with a friend, or join an
                existing match using their invite.
            </p>

            <div style={{ marginTop: 18 }}>
                <Link href="/mode-select" className={styles.secondaryCta}>
                ← Back to mode selection
                </Link>
            </div>
        </section>

        <section className={styles.previewSection}>
          <div className={styles.modeGrid}>
            {/* Create room card */}
            <div className={styles.modeCard}>
              <div className={styles.modeCardHeader}>
                <span className={styles.modeBadge}>Host a match</span>
                <h2 className={styles.modeTitle}>Create room</h2>
                <p className={styles.modeTagline}>
                  Generate a room code and share it with your friend.
                </p>
              </div>

              <div className={styles.modeBody}>
                <p className={styles.modeDescription}>
                  Customize your room name so your friend knows they’re in the right lobby.
                </p>

                <form
                  onSubmit={handleCreateRoom}
                  className={styles.formColumn}
                >
                  <input
                    id="room-name"
                    name="room-name"
                    type="text"
                    required
                    value={createRoomName}
                    onChange={(e) => setCreateRoomName(e.target.value)}
                    className={styles.textInput}
                    disabled
                  />

                  <button type="submit" className={styles.primaryCta}>
                    Create room
                  </button>
                </form>
              </div>
            </div>

            {/* Join room card */}
            <div className={styles.modeCard}>
              <div className={styles.modeCardHeader}>
                <span className={styles.modeBadge}>Join a friend</span>
                <h2 className={styles.modeTitle}>Join game</h2>
                <p className={styles.modeTagline}>
                  Enter the room code shared by the host to jump in.
                </p>
              </div>

              <div className={styles.modeBody}>
                <p className={styles.modeDescription}>
                  Room codes are short and shareable. Paste it below and we’ll connect you.
                </p>

                <form
                  onSubmit={handleJoinRoom}
                  className={styles.formColumn}
                >
                  <input
                    id="room-code"
                    name="room-code"
                    type="text"
                    required
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className={styles.textInput}
                    disabled
                  />

                  <button type="submit" className={styles.secondaryCta}>
                    Join game
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
