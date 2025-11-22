
"use client";

import React from "react";
import styles from "./TicTacToe.module.css";

type Props = {
  value: string | null;
  onSquareClick: () => void;
  disabled?: boolean;
  index?: number;
};

export const Square: React.FC<Props> = ({ value, onSquareClick, disabled = false }) => {
  return (
    <button
      className={styles.square}
      onClick={onSquareClick}
      disabled={disabled}
      aria-label={value ? `Square ${value}` : "Empty square"}
    >
      {value}
    </button>
  );
};
