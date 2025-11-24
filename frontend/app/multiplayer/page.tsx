"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../Landing.module.css";
import { addToMatchmaker } from "@/lib/nakamajs";
import { useUser } from "@/lib/hook/UserContext";
import type { Session } from "@heroiclabs/nakama-js";

export default function MultiplayerPage() {
  const [createRoomName, setCreateRoomName] = useState<string>("");
  const [joinCode, setJoinCode] = useState<string>("");
  const { user } = useUser();
  const router = useRouter();

  function handleCreateRoom(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    // Later you can implement private-room style logic here.
    // For now just log.
    console.log("Create Room clicked with name:", createRoomName);
  }

  async function handleJoinRoom(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    console.log("Preparing matchmaking...");

    if (!user) {
      console.log("Please login first.");
      return;
    }

    try {
      // 1) Add this user to the matchmaker queue
      const ticket = await addToMatchmaker(user as Session, "*", 2, 2);
      console.log("Submitted to matchmaker, ticket:", ticket);

      // 2) Navigate to waiting room.
      // The waiting room page will attach the Nakama handlers and listen for matches.
      router.push("/multiplayer/waiting");
    } catch (error) {
      console.error("Error starting matchmaking:", error);
      console.log(`Matchmaking error: ${String(error)}`);
    }
  }

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
            Create a new room and share the code with a friend, or join an existing
            match using their invite.
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

                <form onSubmit={handleCreateRoom} className={styles.formColumn}>
                  <input
                    id="room-name"
                    name="room-name"
                    type="text"
                    required
                    value={createRoomName}
                    onChange={(event) => setCreateRoomName(event.target.value)}
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

                <form onSubmit={handleJoinRoom} className={styles.formColumn}>
                  <input
                    id="room-code"
                    name="room-code"
                    type="text"
                    required
                    value={joinCode}
                    onChange={(event) => setJoinCode(event.target.value)}
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
