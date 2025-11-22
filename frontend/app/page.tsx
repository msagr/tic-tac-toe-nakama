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

"use client";

import React from "react";
import dynamic from "next/dynamic";

const Game = dynamic(() => import("../components/tic/Game").then((m) => m.Game), {
  ssr: false,
});

export default function TicTacToePage() {
  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ fontSize: 20, marginBottom: 6 }}>Tic-Tac-Toe</h1>
      <p style={{ marginBottom: 18, color: "#94a3b8" }}>Play locally — history & jump-to-move</p>

      <Game />
    </main>
  );
}

