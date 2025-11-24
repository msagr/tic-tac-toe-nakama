"use client";

import Link from "next/link";
import styles from "../Landing.module.css";

type Mode = {
  id: "multiplayer" | "computer";
  title: string;
  tagline: string;
  description: string;
  href: string;
  badge: string;
};

const MODES: Mode[] = [
  {
    id: "multiplayer",
    title: "Multiplayer",
    tagline: "Play with real opponents",
    description: "Create or join a room, then challenge a friend in real time.",
    href: "/multiplayer", // TODO: create this page / route
    badge: "Online · Real-time",
  }
];

function ModeCard({ mode }: { mode: Mode }) {
  return (
    <Link href={mode.href} className={styles.modeCard}>
      <div className={styles.modeCardHeader}>
        <span className={styles.modeBadge}>{mode.badge}</span>
        <h2 className={styles.modeTitle}>{mode.title}</h2>
        <p className={styles.modeTagline}>{mode.tagline}</p>
      </div>

      <div className={styles.modeBody}>
        <p className={styles.modeDescription}>{mode.description}</p>
        <ul className={styles.modeMetaList}>
          {mode.id === "multiplayer" ? (
            <>
              <li className={styles.modePill}>Real-time sync</li>
              <li className={styles.modePill}>Rooms & invites</li>
            </>
          ) : (
            <>
              <li className={styles.modePill}>Adaptive difficulty</li>
              <li className={styles.modePill}>No internet required</li>
              <li className={styles.modePill}>Perfect for practice</li>
            </>
          )}
        </ul>
      </div>

      <div className={styles.modeFooter}>
        <span className={styles.modeCtaLabel}>Start {mode.id}</span>
        <span className={styles.modeArrow}>→</span>
      </div>
    </Link>
  );
}

export default function ModeSelectPage() {
  return (
    <div className={styles.page}>
      <div className={styles.noise} />

      <main className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.brandBadge}>XOXO Multiplayer</div>
          <h1 className={styles.title}>
            Choose how you want to <span className={styles.highlight}>play.</span>
          </h1>
          <p className={styles.subtitle}>
            Jump into a real‑time multiplayer match, or warm up against the computer.
            You can switch modes anytime.
          </p>
        </section>

        <section className={styles.previewSection}>
          <div className={styles.modeGrid}>
            {MODES.map((mode) => (
              <ModeCard key={mode.id} mode={mode} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}