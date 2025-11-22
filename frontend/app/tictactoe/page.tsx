"use client";

import React from "react";
import dynamic from "next/dynamic";

const Game = dynamic(() => import("../../components/tic/Game").then((m) => m.Game), {
  ssr: false,
});

export default function TicTacToePage() {
  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ fontSize: 20, marginBottom: 6 }}>Tic-Tac-Toe</h1>
      <p style={{ marginBottom: 18, color: "#94a3b8" }}>
        Play locally — history &amp; jump-to-move
      </p>
      <Game />
    </main>
  );
}
