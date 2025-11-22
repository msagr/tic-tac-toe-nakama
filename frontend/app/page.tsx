// // "use client";

// // import { useEffect, useState } from "react";
// // import { Client } from "@heroiclabs/nakama-js";

// // export default function Home() {
// //   const [status, setStatus] = useState("Initializing...");

// //   useEffect(() => {
// //     const run = async () => {
// //       try {
// //         const client = new Client("defaultkey", "127.0.0.1", "7350", false, 10000);

// //         let deviceId = localStorage.getItem("@MyApp:deviceKey");
// //         if (!deviceId) {
// //           deviceId = crypto.randomUUID().toString();
// //           localStorage.setItem("@MyApp:deviceKey", deviceId);
// //         }

// //         const create = true;
// //         const session = await client.authenticateDevice(deviceId, create, "mycustomusername");
// //         console.info("Successfully authenticated: ", session);
// //         setStatus("Authenticated");
// //       } catch (err) {
// //         console.error("Auth error:", err);

// //         setStatus("Auth failed");
// //       }
// //     };

// //     run();
// //   }, []);

// //   return <div>{status}</div>;
// // }

// "use client";

// import Link from "next/link";
// import Image from "next/image";

// export default function HomePage() {
//   return (
//     <div className="container">
//       <div className="card">
//         <div className="title">XOXO Multiplayer</div>
//         <div className="subtitle">Real-time Nakama-powered TicTacToe</div>

//         <div className="canvas-wrap">
//           <Image src="/assets/X.png" width={120} height={120} alt="X" />
//           <Image src="/assets/O.png" width={120} height={120} alt="O" />
//         </div>

//         <div className="row">
//           <Link href="/game"><button className="btn">Play Classic</button></Link>
//           <Link href="/matchmaking"><button className="btn secondary">Timed Mode</button></Link>
//         </div>

//         <div className="status">Open another window to test multiplayer.</div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import React from "react";
// import dynamic from "next/dynamic";

// const Game = dynamic(() => import("../components/tic/Game").then((m) => m.Game), {
//   ssr: false,
// });

// export default function TicTacToePage() {
//   return (
//     <main style={{ padding: 20 }}>
//       <h1 style={{ fontSize: 20, marginBottom: 6 }}>Tic-Tac-Toe</h1>
//       <p style={{ marginBottom: 18, color: "#94a3b8" }}>Play locally — history & jump-to-move</p>

//       <Game />
//     </main>
//   );
// }

import Link from "next/link";
import styles from "./Landing.module.css";

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.noise} />

      <main className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.brandBadge}>XOXO Multiplayer</div>

          <h1 className={styles.title}>
            Turn simple <span className={styles.highlight}>Tic‑Tac‑Toe</span>{" "}
            into a next‑gen arena.
          </h1>

          <p className={styles.subtitle}>
            Authenticated profiles, rich match history, and a polished board
            experience. Powered by Next.js and Nakama, built for fast iteration.
          </p>

          <div className={styles.ctaRow}>
            <Link href="/login" className={styles.primaryCta}>
              Login
            </Link>
            <Link href="/register" className={styles.secondaryCta}>
              Register
            </Link>
          </div>

          <div className={styles.metaRow}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Mode</span>
              <span className={styles.metaValue}>Local vs Friend</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Backend</span>
              <span className={styles.metaValue}>Nakama</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Stack</span>
              <span className={styles.metaValue}>Next.js App Router</span>
            </div>
          </div>
        </section>

        <section className={styles.previewSection}>
          <div className={styles.previewCard}>
            <div className={styles.previewGlow} />

            <header className={styles.previewHeader}>
              <span className={styles.previewTag}>Live demo</span>
              <h2 className={styles.previewTitle}>Play Tic‑Tac‑Toe now</h2>
              <p className={styles.previewSubtitle}>
                Jump directly into a polished local match. No account required.
              </p>
            </header>

            <div className={styles.previewBody}>
              <div className={styles.boardSkeleton}>
                <div className={styles.boardRow}>
                  <div className={`${styles.cell} ${styles.cellX}`}>X</div>
                  <div className={styles.cell}>O</div>
                  <div className={styles.cell}></div>
                </div>
                <div className={styles.boardRow}>
                  <div className={styles.cell}></div>
                  <div className={`${styles.cell} ${styles.cellO}`}>O</div>
                  <div className={styles.cell}></div>
                </div>
                <div className={styles.boardRow}>
                  <div className={`${styles.cell} ${styles.cellX}`}>X</div>
                  <div className={styles.cell}></div>
                  <div className={styles.cell}></div>
                </div>
              </div>

              <div className={styles.previewFooter}>
                <Link href="/tictactoe" className={styles.playCta}>
                  Play as Guest
                </Link>
                <p className={styles.previewHint}>
                  Want persistent stats?{" "}
                  <Link href="/register" className={styles.inlineLink}>
                    Create an account
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}