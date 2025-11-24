"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/hook/UserContext";
import { client, getSocket } from "@/lib/nakamajs";
import type { Session } from "@heroiclabs/nakama-js";
import styles from "../Landing.module.css";

export default function CreateRoomPage() {
  const [roomName, setRoomName] = useState<string>("");
  const [roomDescription, setRoomDescription] = useState<string>("");
  const { user } = useUser();
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
  event.preventDefault();

  if (!user) {
    console.log("You must be logged in to create a room.");
    return;
  }

  try {
    const session = user as Session;
    const rpcRes = await client.rpc(session, "create_room", {
      roomName,
      roomDescription,
    });

    const payload = (rpcRes.payload ?? null) as { matchId: string } | null;

    const matchId = payload?.matchId;
    if (!matchId) {
      console.error("create_room RPC did not return a matchId", rpcRes);
      return;
    }

    const socket = await getSocket(session, true);
    await socket.joinMatch(matchId);

    const query = new URLSearchParams({
      matchId,
      roomName,
      roomDescription,
    });

    router.push(`/multiplayer/game?${query.toString()}`);
  } catch (e) {
    console.error("Failed to create room:", e);
  }
}
  return (
    <div className={styles.page}>
      <div className={styles.noise} />

      <main className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.brandBadge}>XOXO Multiplayer</div>
          <h1 className={styles.title}>
            Create a <span className={styles.highlight}>new room.</span>
          </h1>
          <p className={styles.subtitle}>
            Give your room a friendly name and short description so your friends know
            they’re in the right lobby.
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
                <span className={styles.modeBadge}>Room details</span>
                <h2 className={styles.modeTitle}>Room setup</h2>
                <p className={styles.modeTagline}>
                  Fill in the basics and hit create to continue.
                </p>
              </div>

              <div className={styles.modeBody}>
                <form onSubmit={handleSubmit} className={styles.formColumn}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                      gap: 6,
                      marginBottom: 12,
                    }}
                  >
                    <label htmlFor="room-name" className={styles.formLabel}>
                      Room name
                    </label>
                    <input
                      id="room-name"
                      name="room-name"
                      type="text"
                      required
                      value={roomName}
                      onChange={(event) => setRoomName(event.target.value)}
                      className={styles.textInput}
                      placeholder="Friday Night Tic-Tac-Toe"
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                      gap: 6,
                      marginBottom: 14,
                    }}
                  >
                    <label htmlFor="room-description" className={styles.formLabel}>
                      Room description
                    </label>
                    <textarea
                      id="room-description"
                      name="room-description"
                      rows={3}
                      value={roomDescription}
                      onChange={(event) => setRoomDescription(event.target.value)}
                      className={styles.textInput}
                      placeholder="Friendly match"
                    />
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      display: "flex",
                      justifyContent: "flex-start",
                    }}
                  >
                    <button type="submit" className={styles.primaryCta}>
                      Create room
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
