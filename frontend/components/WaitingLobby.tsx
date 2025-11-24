"use client";

import styles from "./WaitingLobby.module.css";

type WaitingLobbyProps = {
  selfName: string;
  opponentName?: string | null;
  status?: string;
  countdownSeconds?: number | null;
};

export function WaitingLobby({ selfName, opponentName, status, countdownSeconds }: WaitingLobbyProps) {
  const opponentInitial =
    opponentName && opponentName.length > 0
      ? opponentName[0].toUpperCase()
      : "?";

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Waiting for Opponent</h1>
        <p className={styles.subtitle}>Sit tight while we find someone for you.</p>

        <div className={styles.frames}>
          <div className={styles.playerFrame}>
            <div className={styles.avatar}>{selfName[0].toUpperCase()}</div>
            <span className={styles.label}>{selfName}</span>
            <span className={styles.tagYou}>You</span>
          </div>

          <div className={styles.vs}>VS</div>

          <div className={styles.playerFrame}>
            <div
                className={opponentName ? styles.avatar : styles.avatarMuted}
            >
                {opponentInitial}
            </div>
            <span className={styles.label}>
                {opponentName ?? "Searching..."}
            </span>
            {opponentName ? (
                <span className={styles.tagYou}>Opponent</span>
            ) : (
                <span className={styles.pulse}>Finding opponent</span>
            )}
        </div>
        </div>

        {/* Optional status text */}
        {status && (
          <p className={styles.status}>{status}</p>
        )}

        {/* Countdown message once a match is ready */}
        {opponentName && countdownSeconds !== null && countdownSeconds as number > 0 && (
          <p className={styles.countdown}>Game begins in {countdownSeconds}...</p>
        )}

        {!opponentName && (
          <div className={styles.loadingDots}>
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>
        )}
      </div>
    </div>
  );
}
