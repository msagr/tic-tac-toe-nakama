"use client";

import Link from "next/link";
import styles from "../Landing.module.css";

type RoomKind = "private" | "secondary";

type RoomOption = {
  id: RoomKind;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  highlights: string[];
};

const ROOM_OPTIONS: RoomOption[] = [
  {
    id: "private",
    title: "Private room",
    badge: "Invite‑only",
    tagline: "Perfect for 1‑on‑1 games with friends.",
    description:
      "Only players with the invite code can join. Great for focused matches and testing.",
    highlights: ["Shareable room code", "No public listing", "Low noise, high control"],
  },
  {
    id: "secondary",
    title: "Public room",
    badge: "Open lobby",
    tagline: "Great for casual or backup games.",
    description:
      "Secondary rooms are easier to discover and can be reused as backup lobbies.",
    highlights: ["Easier to reuse", "Can be shared with groups", "Ideal for quick games"],
  },
];

function RoomCard({ option }: { option: RoomOption }) {
  return (
    <div className={styles.modeCard}>
      <div className={styles.modeCardHeader}>
        <span className={styles.modeBadge}>{option.badge}</span>
        <h2 className={styles.modeTitle}>{option.title}</h2>
        <p className={styles.modeTagline}>{option.tagline}</p>
      </div>

      <div className={styles.modeBody}>
        <p className={styles.modeDescription}>{option.description}</p>
        <ul className={styles.modeMetaList}>
          {option.highlights.map((h) => (
            <li key={h} className={styles.modePill}>
              {h}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.modeFooter}>
        <span className={styles.modeCtaLabel}>
          Create {option.id === "private" ? "private" : "public"} room
        </span>
        <span className={styles.modeArrow}>→</span>
      </div>
    </div>
  );
}

export default function CreateRoomPage() {
  return (
    <div className={styles.page}>
      <div className={styles.noise} />

      <main className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.brandBadge}>XOXO Multiplayer</div>
          <h1 className={styles.title}>
            Choose your <span className={styles.highlight}>room type.</span>
          </h1>
          <p className={styles.subtitle}>
            Create a private invite‑only room, or spin up a secondary room that’s easier to
            reuse for quick matches.
          </p>

          <div style={{ marginTop: 18 }}>
            <Link href="/multiplayer" className={styles.secondaryCta}>
              ← Back to multiplayer setup
            </Link>
          </div>
        </section>

        <section className={styles.previewSection}>
          <div className={styles.modeGrid}>
            {ROOM_OPTIONS.map((option) => (
              <RoomCard key={option.id} option={option} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
