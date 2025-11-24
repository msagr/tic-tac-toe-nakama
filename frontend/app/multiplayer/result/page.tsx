"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";

type ResultPlayer = {
  name: string;
  initial: string;
  symbol: "X" | "O" | null;
};

function ResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selfName = searchParams.get("selfName") ?? "You";
  const selfInitial = searchParams.get("selfInitial") ?? "?";
  const selfSymbol = (searchParams.get("selfSymbol") as "X" | "O" | null) ?? null;

  const oppName = searchParams.get("opponentName") ?? "Opponent";
  const oppInitial = searchParams.get("opponentInitial") ?? "?";
  const oppSymbol = (searchParams.get("opponentSymbol") as "X" | "O" | null) ?? null;

  const result = (searchParams.get("result") as "X" | "O" | "draw") ?? "draw";
  const roomName = searchParams.get("roomName") ?? "Custom Room";

  const self: ResultPlayer = { name: selfName, initial: selfInitial, symbol: selfSymbol };
  const opponent: ResultPlayer = { name: oppName, initial: oppInitial, symbol: oppSymbol };

  const isDraw = result === "draw";
  const selfIsWinner = !isDraw && self.symbol === result;
  const opponentIsWinner = !isDraw && opponent.symbol === result;

  const selfScore = isDraw ? 50 : selfIsWinner ? 100 : 0;
  const opponentScore = isDraw ? 50 : opponentIsWinner ? 100 : 0;

  const frameStyle = (isWinner: boolean) => ({
    borderRadius: 999,
    padding: "16px 24px",
    border: `2px solid ${
      isDraw
        ? "rgba(148,163,184,0.7)"
        : isWinner
        ? "rgba(34,197,94,0.9)"
        : "rgba(248,113,113,0.9)"
    }`,
    background:
      "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(3,7,18,0.98))",
    boxShadow: isWinner
      ? "0 18px 45px rgba(34,197,94,0.45)"
      : "0 14px 32px rgba(0,0,0,0.8)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 10,
    minWidth: 220,
  });

  const scoreLabel = (score: number) => (score > 0 ? `+${score}` : "+0");

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: "radial-gradient(circle at top, #1f2937, #020617)",
        color: "#e5e7eb",
      }}
    >
      <div style={{ width: "100%", maxWidth: 760 }}>
        <header style={{ marginBottom: 24, textAlign: "center" }}>
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {roomName}
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "0.95rem" }}>
            {isDraw ? "Game ended in a draw." : "Final result"}
          </p>
        </header>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 28,
            marginBottom: 24,
          }}
        >
          {/* Self */}
          <div style={frameStyle(selfIsWinner)}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "1rem",
                  background: selfIsWinner
                    ? "radial-gradient(circle at 20% 0%, #22c55e, #16a34a)"
                    : "radial-gradient(circle at 20% 0%, #111827, #020617)",
                  color: "#ecfdf3",
                }}
              >
                {self.initial}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: "1rem", fontWeight: 500 }}>
                  {self.name} {self.symbol ? `(${self.symbol})` : ""}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: selfIsWinner ? "#22c55e" : isDraw ? "#9ca3af" : "#f97373",
                  }}
                >
                  {selfIsWinner ? "Winner" : isDraw ? "Draw" : "Loser"}
                </span>
              </div>
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "#e5e7eb",
              }}
            >
              {scoreLabel(selfScore)}
            </div>
          </div>

          {/* Opponent */}
          <div style={frameStyle(opponentIsWinner)}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "1rem",
                  background: opponentIsWinner
                    ? "radial-gradient(circle at 20% 0%, #22c55e, #16a34a)"
                    : "radial-gradient(circle at 20% 0%, #111827, #020617)",
                  color: "#ecfdf3",
                }}
              >
                {oppInitial}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: "1rem", fontWeight: 500 }}>
                  {oppName} {oppSymbol ? `(${oppSymbol})` : ""}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: opponentIsWinner
                      ? "#22c55e"
                      : isDraw
                      ? "#9ca3af"
                      : "#f97373",
                  }}
                >
                  {opponentIsWinner ? "Winner" : isDraw ? "Draw" : "Loser"}
                </span>
              </div>
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "#e5e7eb",
              }}
            >
              {scoreLabel(opponentScore)}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            onClick={() => router.push("/multiplayer")}
            style={{
              padding: "10px 22px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.6)",
              background: "transparent",
              color: "#e5e7eb",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Back to multiplayer
          </button>
        </div>
      </div>
    </main>
  );
}

export default ResultPage;