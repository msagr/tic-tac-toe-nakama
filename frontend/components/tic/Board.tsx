
"use client";

import React, { useCallback } from "react";
import { Square } from "./Square";
import styles from "./TicTacToe.module.css";
import type { BoardState } from "@/types/tic";
import { calculateWinner } from "@/lib/tic/utils";

type BoardProps = {
  xIsNext: boolean;
  squares: BoardState;
  onPlay: (nextSquares: BoardState) => void;
};

export const Board: React.FC<BoardProps> = ({ xIsNext, squares, onPlay }) => {
  const handleClick = useCallback(
    (i: number) => {
      if (calculateWinner(squares) || squares[i]) return;
      const nextSquares = squares.slice() as BoardState;
      nextSquares[i] = xIsNext ? "X" : "O";
      onPlay(nextSquares);
    },
    [squares, xIsNext, onPlay]
  );

  const winner = calculateWinner(squares);
  const status = winner ? `Winner: ${winner}` : `Next player: ${xIsNext ? "X" : "O"}`;

  return (
    <>
      <div className={styles.status}>{status}</div>

      <div className={styles.boardRow}>
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>

      <div className={styles.boardRow}>
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>

      <div className={styles.boardRow}>
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
};
