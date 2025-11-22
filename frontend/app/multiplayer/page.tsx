"use client";

import { useState, type FormEvent } from "react";
import styles from "../Landing.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MultiplayerPage() {
  const [createRoomName, setCreateRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const router = useRouter();

  function handleCreateRoom(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Create room:", { name: createRoomName });
    router.push('/create-room')
    // TODO: call Nakama RPC / match create here
  }

  function handleJoinRoom(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Join room with code:", { code: joinCode });
    // TODO: call Nakama RPC / match join here
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
