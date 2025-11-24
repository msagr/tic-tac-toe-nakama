"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/lib/hook/UserContext";
import type { BoardState } from "@/types/tic";
import boardStyles from "@/components/tic/TicTacToe.module.css";
import { useSearchParams } from "next/navigation";
import { Square } from "@/components/tic/Square";
import { getSocket } from "@/lib/nakamajs";
import type { Session } from "@heroiclabs/nakama-js";
import { TTOpCodes } from "@/lib/tic/opcodes";

const createInitialBoard = (): BoardState => Array(9).fill(null);


export default function MultiplayerGamePage() {
  const { user } = useUser();
  const selfName = user?.username ?? "You";

  const searchParams = useSearchParams();
  const opponentNameParam = searchParams.get("opponent");
  const matchId = searchParams.get("matchId");

  const opponentName =
  opponentNameParam && opponentNameParam.trim().length > 0
    ? opponentNameParam
    : "Opponent";

  const [squares, setSquares] = useState<BoardState>(createInitialBoard);
  const [currentTurn, setCurrentTurn] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<"X" | "O" | "draw" | null>(null);
  const [selfSymbol, setSelfSymbol] = useState<"X" | "O" | null>(null);
  const [opponentSymbol, setOpponentSymbol] = useState<"X" | "O" | null>(null);

  useEffect(() => {
    if (!user || !matchId) return;

    let cancelled = false;

    (async () => {
        const socket = await getSocket(user as Session, true);
        if (cancelled) return;

        try {
          if (matchId) {
            await socket.sendMatchState(
              matchId,
              TTOpCodes.SyncState,
              JSON.stringify({})
            );
          }
        } catch (e) {
          console.error("Failed to request initial board state:", e);
        }

        socket.onmatchdata = (matchData) => {
  if (matchData.op_code !== TTOpCodes.BoardState) return;

  try {
    const json = new TextDecoder().decode(matchData.data);
    console.log("Raw match data:", json);

    const payload = JSON.parse(json) as {
      board: ("X" | "O" | null)[];
      currentTurn: "X" | "O";
      winner: "X" | "O" | "draw" | null;
      symbols?: Record<string, "X" | "O">;
    };

    setSquares(payload.board as BoardState);
    setCurrentTurn(payload.currentTurn);
    setWinner(payload.winner);

    if (payload.symbols && user) {
      const myUserId = (user as Session).user_id;
      const mySymbol = payload.symbols[myUserId as string] ?? null;
      const opponentEntry = Object.entries(payload.symbols).find(
        ([userId]) => userId !== myUserId
      );
      const oppSymbol = opponentEntry ? opponentEntry[1] : null;

      setSelfSymbol(mySymbol);
      setOpponentSymbol(oppSymbol);
    }
  } catch (e) {
    console.error("Failed to parse board state:", e);
  }
};
  })();

  return () => {
    cancelled = true;
  };
}, [user, matchId]);

    const handleMove = async (index: number) => {
        if (!user || !matchId) return;
        if (winner) return;           // local guard
        if (squares[index] !== null) return;

        try {
            const socket = await getSocket(user as Session, true);
            await socket.sendMatchState(
            matchId,
            TTOpCodes.Move,
            JSON.stringify({ index })
            );
        } catch (e) {
            console.error("Failed to send move:", e);
        }
    };

  const selfInitial = selfName[0]?.toUpperCase() ?? "?";
  const opponentInitial = opponentName[0]?.toUpperCase() ?? "?";

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
        {/* Header */}
        <header style={{ marginBottom: 18 }}>
          <h1
            style={{
              fontSize: "1.7rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Multiplayer Match
          </h1>
          <p
            style={{
              color: "#9ca3af",
              fontSize: "0.9rem",
            }}
          >
            Get three in a row before your opponent. You are on the bottom side.
          </p>
        </header>

        {/* Main vertical layout: opponent / board / self */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {/* Opponent panel (top, like chess.com) */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PlayerPanel
              name={opponentName}
              initial={opponentInitial}
              label="Opponent"
              align="top"
              symbol={opponentSymbol}
            />
          </div>

          {/* Board in the middle, using existing themed styles */}
          <div className={boardStyles.game}>
            <div className={boardStyles.gameBoard}>
                {/* Status line driven by server state */}
                <div className={boardStyles.status}>
                {winner
                    ? winner === "draw"
                    ? "Game over: Draw"
                    : `Winner: ${winner}`
                    : `Next player: ${currentTurn}`}
                </div>

                {/* 3x3 board */}
                <div className={boardStyles.boardRow}>
                <Square value={squares[0]} onSquareClick={() => handleMove(0)} />
                <Square value={squares[1]} onSquareClick={() => handleMove(1)} />
                <Square value={squares[2]} onSquareClick={() => handleMove(2)} />
                </div>

                <div className={boardStyles.boardRow}>
                <Square value={squares[3]} onSquareClick={() => handleMove(3)} />
                <Square value={squares[4]} onSquareClick={() => handleMove(4)} />
                <Square value={squares[5]} onSquareClick={() => handleMove(5)} />
                </div>

                <div className={boardStyles.boardRow}>
                <Square value={squares[6]} onSquareClick={() => handleMove(6)} />
                <Square value={squares[7]} onSquareClick={() => handleMove(7)} />
                <Square value={squares[8]} onSquareClick={() => handleMove(8)} />
                </div>
            </div>
            </div>

          {/* Self panel (bottom) */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PlayerPanel
              name={selfName}
              initial={selfInitial}
              label="You"
              align="bottom"
              highlight
              symbol={selfSymbol}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

type PlayerPanelProps = {
  name: string;
  initial: string;
  label: string;
  align: "top" | "bottom";
  highlight?: boolean;
  symbol?: "X" | "O" | null;
};

const PlayerPanel: React.FC<PlayerPanelProps> = ({
  name,
  initial,
  label,
  align,
  highlight = false,
  symbol,
}) => {
  const isTop = align === "top";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 16px",
        borderRadius: 999,
        background:
          "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(3,7,18,0.98))",
        border: "1px solid rgba(148,163,184,0.4)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.7)",
        transform: isTop ? "translateY(0)" : "translateY(0)",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: "1rem",
          background: highlight
            ? "radial-gradient(circle at 20% 0%, #22c55e, #16a34a)"
            : "radial-gradient(circle at 20% 0%, #111827, #020617)",
          color: highlight ? "#ecfdf3" : "#e5e7eb",
          boxShadow: highlight
            ? "0 12px 26px rgba(34,197,94,0.4)"
            : "0 10px 20px rgba(15,23,42,0.9)",
        }}
      >
        {initial}
      </div>

      {/* Name + label */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        <span
          style={{
            fontSize: "0.95rem",
            fontWeight: 500,
          }}
        >
          {symbol ? `${name} (${symbol})` : name}
        </span>
        <span
          style={{
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: highlight ? "#22c55e" : "#9ca3af",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};
