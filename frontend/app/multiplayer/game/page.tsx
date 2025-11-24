"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, useRef } from "react";
import { useUser } from "@/lib/hook/UserContext";
import type { BoardState } from "@/types/tic";
import boardStyles from "@/components/tic/TicTacToe.module.css";
import { useSearchParams } from "next/navigation";
import { Square } from "@/components/tic/Square";
import { getSocket } from "@/lib/nakamajs";
import type { Session } from "@heroiclabs/nakama-js";
import { TTOpCodes } from "@/lib/tic/opcodes";
import { useRouter } from "next/navigation";

const createInitialBoard = (): BoardState => Array(9).fill(null);

type PlayerPanelProps = {
  name: string;
  initial: string;
  label: string;
  align: "top" | "bottom";
  highlight?: boolean;
  symbol?: "X" | "O" | null;
  isTurn?: boolean;
};

const PlayerPanel: React.FC<PlayerPanelProps> = ({
  name,
  initial,
  label,
  align,
  highlight = false,
  symbol,
  isTurn = false,
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
        border: isTurn
          ? "2px solid rgba(250,204,21,0.9)"
          : "1px solid rgba(148,163,184,0.4)",
        boxShadow: isTurn
          ? "0 18px 45px rgba(250,204,21,0.45)"
          : "0 16px 40px rgba(0,0,0,0.7)",
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
          {isTurn ? " • Your turn" : ""}
        </span>
      </div>
    </div>
  );
};

export default function MultiplayerGamePage() {
  const { user } = useUser();
  const selfName = user?.username ?? "You";

  const searchParams = useSearchParams();
  const router = useRouter();

  const MATCH_STORAGE_KEY = "nakamaTTTMatch";

  const initialMatchId = searchParams.get("matchId");
  const roomNameParam = searchParams.get("roomName");
  const roomDescriptionParam = searchParams.get("roomDescription");

  const [matchId, setMatchId] = useState<string | null>(initialMatchId);
  const [opponentName, setOpponentName] = useState<string>("Opponent");
  const [squares, setSquares] = useState<BoardState>(createInitialBoard);
  const [currentTurn, setCurrentTurn] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<"X" | "O" | "draw" | null>(null);
  const [selfSymbol, setSelfSymbol] = useState<"X" | "O" | null>(null);
  const [opponentSymbol, setOpponentSymbol] = useState<"X" | "O" | null>(null);
  const hasRedirectedRef = useRef(false);

  const roomName =
    roomNameParam && roomNameParam.trim().length > 0
      ? roomNameParam
      : "Custom Room";

  const roomDescription =
    roomDescriptionParam && roomDescriptionParam.trim().length > 0
      ? roomDescriptionParam
      : "Waiting for both players to join.";

  const isMyTurn = selfSymbol !== null && currentTurn === selfSymbol;
  const isOpponentTurn = opponentSymbol !== null && currentTurn === opponentSymbol;

  useEffect(() => {
    if (!user) {
        const next = `/create-room`;
        router.push(`/register?next=${encodeURIComponent(next)}`);
        return;
    }

    let cancelled = false;

    (async () => {
      let effectiveMatchId = matchId;

      if (!effectiveMatchId) {
        if (typeof window !== "undefined") {
          try {
            const stored = window.localStorage.getItem(MATCH_STORAGE_KEY);
            if (stored) {
              const parsed = JSON.parse(stored) as {
                matchId?: string | null;
                opponentName?: string | null;
              };

              if (parsed.matchId) {
                effectiveMatchId = parsed.matchId;
                setMatchId(parsed.matchId);
              }

              if (parsed.opponentName) {
                setOpponentName(parsed.opponentName);
              }
            }
          } catch (e) {
            console.error("Failed to read match info from storage:", e);
          }
        }
      }

      if (!effectiveMatchId) {
        return;
      }

      const socket = await getSocket(user as Session, true);
      if (cancelled) return;

      try {
        await socket.joinMatch(effectiveMatchId);
      } catch (e) {
        console.error("Failed to join match on game page:", e);
      }

      try {
        await socket.sendMatchState(
          effectiveMatchId,
          TTOpCodes.SyncState,
          JSON.stringify({})
        );
      } catch (e) {
        console.error("Failed to request initial board state:", e);
      }

      socket.onmatchdata = (matchData) => {
        if (matchData.op_code !== TTOpCodes.BoardState) return;

        try {
          const json = new TextDecoder().decode(matchData.data);
          const payload = JSON.parse(json) as {
            board: ("X" | "O" | null)[];
            currentTurn: "X" | "O";
            winner: "X" | "O" | "draw" | null;
            symbols?: Record<string, "X" | "O">;
            usernames?: Record<string, string>;
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

            const usernames = payload.usernames || {};
            const opponentUserId = opponentEntry ? opponentEntry[0] : null;

            if (opponentUserId && usernames[opponentUserId]) {
              setOpponentName(usernames[opponentUserId]);
            } else {
              const entries = Object.entries(usernames);
              if (entries.length > 0) {
                const fallbackName = entries.find(([, name]) => name !== selfName)?.[1]
                  ?? entries[0][1];
                if (fallbackName) {
                  setOpponentName(fallbackName);
                }
              }
            }
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

  useEffect(() => {
  if (!winner) return;                    // ensure game is finished
  if (!selfSymbol || !opponentSymbol) return;
  if (hasRedirectedRef.current) return;

  hasRedirectedRef.current = true;

  const selfInitial = selfName[0]?.toUpperCase() ?? "?";
  const opponentInitial = opponentName[0]?.toUpperCase() ?? "?";

  const params = new URLSearchParams({
    selfName,
    selfInitial,
    selfSymbol: selfSymbol ?? "",
    opponentName,
    opponentInitial,
    opponentSymbol: opponentSymbol ?? "",
    result: winner,                       // now typed as "X" | "O" | "draw"
    roomName,
  });

  router.push(`/multiplayer/result?${params.toString()}`);
}, [
  winner,
  selfSymbol,
  opponentSymbol,
  selfName,
  opponentName,
  roomName,
  router,
]);

  const handleMove = async (index: number) => {
    if (!user || !matchId) return;
    if (winner) return;
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
            {roomName}
          </h1>
          <p
            style={{
              color: "#9ca3af",
              fontSize: "0.9rem",
            }}
          >
            {roomDescription}
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
          {/* Opponent panel (top) */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PlayerPanel
              name={opponentName}
              initial={opponentInitial}
              label="Opponent"
              align="top"
              symbol={opponentSymbol}
              isTurn={isOpponentTurn}
            />
          </div>

          {/* Board */}
          <div className={boardStyles.game}>
            <div className={boardStyles.gameBoard}>
              {/* Status */}
              <div className={boardStyles.status}>
                {winner
                  ? winner === "draw"
                    ? "Game over: Draw"
                    : `Winner: ${winner}`
                  : `Next player: ${currentTurn}`}
              </div>

              {/* 3x3 board */}
              <div className={boardStyles.boardRow}>
                <Square
                  value={squares[0]}
                  onSquareClick={() => handleMove(0)}
                />
                <Square
                  value={squares[1]}
                  onSquareClick={() => handleMove(1)}
                />
                <Square
                  value={squares[2]}
                  onSquareClick={() => handleMove(2)}
                />
              </div>

              <div className={boardStyles.boardRow}>
                <Square
                  value={squares[3]}
                  onSquareClick={() => handleMove(3)}
                />
                <Square
                  value={squares[4]}
                  onSquareClick={() => handleMove(4)}
                />
                <Square
                  value={squares[5]}
                  onSquareClick={() => handleMove(5)}
                />
              </div>

              <div className={boardStyles.boardRow}>
                <Square
                  value={squares[6]}
                  onSquareClick={() => handleMove(6)}
                />
                <Square
                  value={squares[7]}
                  onSquareClick={() => handleMove(7)}
                />
                <Square
                  value={squares[8]}
                  onSquareClick={() => handleMove(8)}
                />
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
              isTurn={isMyTurn}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
