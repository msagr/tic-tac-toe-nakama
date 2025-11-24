"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/lib/hook/UserContext";
import { client, getSocket } from "@/lib/nakamajs";
import type { Session } from "@heroiclabs/nakama-js";
import styles from "../../Landing.module.css";

interface RoomSummary {
  matchId: string;
  roomName: string | null;
  roomDescription: string | null;
  size: number;
  maxSize: number;
}

export default function RoomsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const session = user as Session;
        const res = await client.rpc(session, "list_rooms", {});

        let parsed: { rooms?: RoomSummary[] } | null = null;
        const raw = res.payload as unknown;
        console.log('raw_data: ', raw)
        try {
          if (typeof raw === "string") {
            parsed = JSON.parse(raw) as { rooms?: RoomSummary[] };
          } else if (raw && typeof raw === "object") {
            parsed = raw as { rooms?: RoomSummary[] };
          }
        } catch (parseErr) {
          console.error("Failed to parse list_rooms payload:", parseErr, raw);
        }

        if (!parsed || !Array.isArray(parsed.rooms)) {
          setRooms([]);
        } else {
          setRooms(parsed.rooms);
        }
      } catch (e) {
        console.error("Failed to list rooms:", e);
        setError("Failed to load rooms.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleJoinRoom(
    matchId: string,
    roomName: string | null,
    roomDescription: string | null
  ) {
    if (!user) {
      console.log("You must be logged in to join a room.");
      return;
    }

    try {
      const session = user as Session;
      const socket = await getSocket(session, true);
      await socket.joinMatch(matchId);

      const query = new URLSearchParams({
        matchId,
        roomName: roomName ?? "Custom Room",
        roomDescription:
          roomDescription ?? "Waiting for both players to join.",
      });

      router.push(`/multiplayer/game?${query.toString()}`);
    } catch (e) {
      console.error("Failed to join room:", e);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.noise} />

      <main className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.brandBadge}>XOXO Multiplayer</div>
          <h1 className={styles.title}>
            Browse <span className={styles.highlight}>available rooms</span>.
          </h1>
          <p className={styles.subtitle}>
            Pick a room to join and jump straight into the match.
          </p>

          <div style={{ marginTop: 18 }}>
            <Link href="/multiplayer" className={styles.secondaryCta}>
              ← Back to multiplayer setup
            </Link>
          </div>
        </section>

        <section className={styles.previewSection}>
          <div className={styles.modeGrid}>
            <div className={styles.modeCard}>
              <div className={styles.modeCardHeader}>
                <span className={styles.modeBadge}>Join a room</span>
                <h2 className={styles.modeTitle}>Available rooms</h2>
                <p className={styles.modeTagline}>
                  Select a room to join. Rooms show their current player count.
                </p>
              </div>

              <div className={styles.modeBody}>
                {loading && (
                  <p className={styles.modeDescription}>Loading rooms...</p>
                )}
                {error && <p className={styles.modeDescription}>{error}</p>}

                {!loading && !error && rooms.length === 0 && (
                  <p className={styles.modeDescription}>
                    No rooms are currently available. Try creating one from the
                    multiplayer setup screen.
                  </p>
                )}

                {!loading && !error && rooms.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {rooms.map((room) => (
                      <button
                        key={room.matchId}
                        type="button"
                        onClick={() =>
                          handleJoinRoom(
                            room.matchId,
                            room.roomName,
                            room.roomDescription
                          )
                        }
                        className={styles.secondaryCta}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 4,
                          textAlign: "left",
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>
                          {room.roomName || "Custom Room"}
                        </span>
                        <span
                          style={{
                            fontSize: "0.85rem",
                            opacity: 0.85,
                          }}
                        >
                          {room.roomDescription ||
                            "No description provided."}
                        </span>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            opacity: 0.75,
                          }}
                        >
                          Players: {room.size}/{room.maxSize}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
