
"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Board } from "./Board";
import styles from "./TicTacToe.module.css";
import type { BoardState } from "@/types/tic";
import { calculateWinner } from "@/lib/tic/utils";

const initialBoard = (): BoardState => Array(9).fill(null);

export const Game: React.FC = () => {
  const [history, setHistory] = useState<BoardState[]>([initialBoard()]);
  const [currentMove, setCurrentMove] = useState<number>(0);

  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  const handlePlay = useCallback(
    (nextSquares: BoardState) => {
      const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
      setHistory(nextHistory);
      setCurrentMove(nextHistory.length - 1);
    },
    [history, currentMove]
  );

  const jumpTo = useCallback((nextMove: number) => {
    setCurrentMove(nextMove);
  }, []);

  const moves = useMemo(
    () =>
      history.map((squares, move) => {
        const description = move > 0 ? `Go to move #${move}` : "Go to game start";
        return (
          <li key={move}>
            <button
              className={styles.historyButton}
              onClick={() => jumpTo(move)}
              aria-current={move === currentMove ? "true" : undefined}
            >
              {description}
            </button>
          </li>
        );
      }),
    [history, jumpTo, currentMove]
  );

  const winner = calculateWinner(currentSquares);

  return (
    <div className={styles.game}>
      <div className={styles.gameBoard}>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>

      <div className={styles.gameInfo}>
        <div className={styles.infoTitle}>History</div>
        <ol className={styles.historyList}>{moves}</ol>
        {winner && <div className={styles.resultBanner}>Winner: {winner}</div>}
      </div>
    </div>
  );
};

export default Game;
